import { FastifyReply } from "fastify";
import { z } from "zod";

import { AuthorizedFastifyRequestWithAppData } from "@app/api";
import { generateToken } from "@app/modules/user/logic/authentication/generateToken";
import { HttpMethods } from "@app/util/api/HttpMethods";
import { AuthorizedController } from "@app/util/api/registerAuthorizedController";

const outputSchema = z.object({
  token: z.string(),
});

export const refreshTokenController: AuthorizedController<typeof outputSchema> =
  {
    method: HttpMethods.Get,
    path: "/auth/refresh-token",
    requiredRoles: [],

    outputSchema,
    bodySchema: z.unknown(),
    queryParamsSchema: z.unknown(),
    pathParamsSchema: z.unknown(),

    execute: async (
      req: AuthorizedFastifyRequestWithAppData,
      _rep: FastifyReply
    ) => {
      return {
        token: generateToken({ id: req.user.id }, "7d"),
      };
    },
  };
