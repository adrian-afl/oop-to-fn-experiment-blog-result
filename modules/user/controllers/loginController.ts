import { FastifyReply } from "fastify";
import { ZodUnknown, z } from "zod";

import { FastifyRequestWithAppData } from "@app/api";
import { login } from "@app/modules/user/logic/authentication/login";
import { HttpMethods } from "@app/util/api/HttpMethods";
import { rateLimit } from "@app/util/api/rateLimit";
import { Controller } from "@app/util/api/registerController";
import { NotAuthenticatedError } from "@app/util/exception/NotAuthenticatedError";

const bodySchema = z.object({
  userName: z
    .string()
    .min(3, "User name must have at least 3 characters")
    .max(16, "User name must have at most 16 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "User name can only contain letters, numbers and an underscore (_)"
    ),
  password: z.string().min(6, "Password must have at least 6 characters"),
});

const outputSchema = z.object({
  token: z.string(),
});

export const loginController: Controller<
  typeof outputSchema,
  ZodUnknown,
  ZodUnknown,
  typeof bodySchema
> = {
  method: HttpMethods.Post,
  path: "/auth/login",
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
    const token = await login(data.body);
    if (!token) {
      throw new NotAuthenticatedError();
    }
    return { token };
  },
};
