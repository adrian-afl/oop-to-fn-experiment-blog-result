import { FastifyInstance, FastifyReply } from "fastify";
import { ZodSchema, ZodUnknown, z } from "zod";

import {
  AuthorizedFastifyRequestWithAppData,
  FastifyRequestWithAppData,
} from "@app/api";
import { UserRoles } from "@app/modules/user/logic/common/UserRoles";
import { RequestData, parseRequestData } from "@app/util/api/parseRequestData";
import {
  Controller,
  registerController,
} from "@app/util/api/registerController";
import { ForbiddenError } from "@app/util/exception/ForbiddenError";
import { NotAuthenticatedError } from "@app/util/exception/NotAuthenticatedError";

export interface AuthorizedController<
  OutType extends ZodSchema = ZodUnknown,
  PathType extends ZodSchema = ZodUnknown,
  QueryType extends ZodSchema = ZodUnknown,
  BodyType extends ZodSchema = ZodUnknown,
> extends Omit<Controller<OutType, PathType, QueryType, BodyType>, "execute"> {
  execute: (
    req: AuthorizedFastifyRequestWithAppData,
    rep: FastifyReply,
    data: RequestData<PathType, QueryType, BodyType>
  ) => z.infer<OutType> | Promise<z.infer<OutType>>;
  requiredRoles: UserRoles[];
}

export const registerAuthorizedController = <
  OutType extends ZodSchema = ZodUnknown,
  PathType extends ZodSchema = ZodUnknown,
  QueryType extends ZodSchema = ZodUnknown,
  BodyType extends ZodSchema = ZodUnknown,
>(
  fastify: FastifyInstance,
  controller: AuthorizedController<OutType, PathType, QueryType, BodyType>
): void => {
  registerController(fastify, {
    ...controller,
    execute: async (
      req: FastifyRequestWithAppData,
      rep: FastifyReply
    ): Promise<z.infer<OutType>> => {
      const data = parseRequestData(controller, req);
      const user = req.user;
      if (!user) {
        throw new NotAuthenticatedError();
      }
      for (const role of controller.requiredRoles) {
        if (
          !user.roles.includes(role) &&
          !user.roles.includes(UserRoles.SystemAdmin)
        ) {
          throw new ForbiddenError(`Lacking role ${role}`);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return controller.execute(
        {
          ...req,
          user,
          version: "authorized",
        } as AuthorizedFastifyRequestWithAppData,
        rep,
        data
      );
    },
  });
};
