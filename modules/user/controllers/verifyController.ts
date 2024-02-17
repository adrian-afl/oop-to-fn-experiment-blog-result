import { FastifyReply } from "fastify";
import { ZodUnknown, z } from "zod";

import { FastifyRequestWithAppData } from "@app/api";
import { verify } from "@app/modules/user/logic/registration/verify";
import { HttpMethods } from "@app/util/api/HttpMethods";
import { rateLimit } from "@app/util/api/rateLimit";
import { Controller } from "@app/util/api/registerController";

const bodySchema = z.object({
  token: z.string().min(6, "Token is invalid"),
});

const outputSchema = z.object({
  success: z.boolean(),
});

export const verifyController: Controller<
  typeof outputSchema,
  ZodUnknown,
  ZodUnknown,
  typeof bodySchema
> = {
  method: HttpMethods.Post,
  path: "/auth/verify",
  additionalRouteConfig: rateLimit(30, false),

  bodySchema,
  outputSchema,
  pathParamsSchema: z.unknown(),
  queryParamsSchema: z.unknown(),

  execute: async (
    _req: FastifyRequestWithAppData,
    _rep: FastifyReply,
    data
  ) => {
    const result = await verify(data.body.token);
    return { success: result };
  },
};
