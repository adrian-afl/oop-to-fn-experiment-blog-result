import { FastifyReply } from "fastify";
import { ZodUnknown, z } from "zod";

import { FastifyRequestWithAppData } from "@app/api";
import { register } from "@app/modules/user/logic/registration/register";
import { HttpMethods } from "@app/util/api/HttpMethods";
import { rateLimit } from "@app/util/api/rateLimit";
import { Controller } from "@app/util/api/registerController";

const bodySchema = z.object({
  userName: z
    .string()
    .min(3, "User name must have at least 3 characters")
    .max(16, "User name must have at most 16 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "User name can only contain letters, numbers and an underscore (_)"
    ),
  email: z.string().email(),
  password: z.string().min(6, "Password must have at least 6 characters"),
  invitationCode: z
    .string()
    .min(6, "Invitation code must have at least 6 characters"),
});

const outputSchema = z.object({
  success: z.boolean(),
});

export const registerUserController: Controller<
  typeof outputSchema,
  ZodUnknown,
  ZodUnknown,
  typeof bodySchema
> = {
  method: HttpMethods.Post,
  path: "/auth/register",
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
    const roles: string[] = [];
    await register({ ...data.body, roles });
    return { success: true };
  },
};
