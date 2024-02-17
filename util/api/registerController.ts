import { FastifyInstance, FastifyReply } from "fastify";
import { RouteOptions } from "fastify/types/route";
import { ZodSchema, ZodUnknown, z } from "zod";

import { FastifyRequestWithAppData } from "@app/api";
import { HttpMethods } from "@app/util/api/HttpMethods";
import { RequestData, parseRequestData } from "@app/util/api/parseRequestData";
import { ApplicationError } from "@app/util/exception/ApplicationError";

export interface Controller<
  OutType extends ZodSchema = ZodUnknown,
  PathType extends ZodSchema = ZodUnknown,
  QueryType extends ZodSchema = ZodUnknown,
  BodyType extends ZodSchema = ZodUnknown,
> {
  method: HttpMethods;
  path: string;
  additionalRouteConfig?: Partial<RouteOptions> | undefined;
  pathParamsSchema: PathType;
  queryParamsSchema: QueryType;
  bodySchema: BodyType;
  outputSchema: OutType;
  execute: (
    req: FastifyRequestWithAppData,
    rep: FastifyReply,
    data: RequestData<PathType, QueryType, BodyType>
  ) => z.infer<OutType> | Promise<z.infer<OutType>>;
}

export const registerController = <
  OutType extends ZodSchema = ZodUnknown,
  PathType extends ZodSchema = ZodUnknown,
  QueryType extends ZodSchema = ZodUnknown,
  BodyType extends ZodSchema = ZodUnknown,
>(
  fastify: FastifyInstance,
  controller: Controller<OutType, PathType, QueryType, BodyType>
): void => {
  if (
    !(controller.bodySchema instanceof ZodUnknown) &&
    [HttpMethods.Get, HttpMethods.Delete].includes(controller.method)
  ) {
    throw new ApplicationError(
      `Path ${controller.path} cannot have body defined because method is ${controller.method}`
    );
  }
  fastify.route({
    method: controller.method,
    url: controller.path,
    handler: async (req, rep) => {
      const data = parseRequestData(controller, req);
      const result = controller.execute(
        req as FastifyRequestWithAppData,
        rep,
        data
      );
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression,@typescript-eslint/no-unsafe-return
      return controller.outputSchema.parse(await result);
    },
    ...controller.additionalRouteConfig,
  });
};
