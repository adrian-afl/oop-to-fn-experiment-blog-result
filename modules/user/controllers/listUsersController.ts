import { FastifyReply } from "fastify";
import { ZodUnknown, z } from "zod";

import { AuthorizedFastifyRequestWithAppData } from "@app/api";
import { listUsers } from "@app/modules/user/logic/common/listUsers";
import {
  transformUser,
  userOutput,
} from "@app/modules/user/transformers/transformUser";
import { HttpMethods } from "@app/util/api/HttpMethods";
import { AuthorizedController } from "@app/util/api/registerAuthorizedController";
import { createPagination } from "@app/util/createPagination";

const outputSchema = z.array(userOutput);

const queryParamsSchema = z.object({
  searchByUserName: z.optional(z.string()),
  skip: z.coerce.number(),
  take: z.coerce.number(),
});

export const listUsersController: AuthorizedController<
  typeof outputSchema,
  ZodUnknown,
  typeof queryParamsSchema
> = {
  method: HttpMethods.Get,
  path: "/users",
  requiredRoles: [],

  queryParamsSchema,
  bodySchema: z.unknown(),
  pathParamsSchema: z.unknown(),

  outputSchema,

  execute: async (
    _req: AuthorizedFastifyRequestWithAppData,
    _rep: FastifyReply,
    data
  ) => {
    const users = await listUsers({
      searchByUserName: data.query.searchByUserName ?? null,
      pagination: createPagination({ ...data.query, limit: 400 }),
    });
    return users.map((a) => transformUser(a));
  },
};
