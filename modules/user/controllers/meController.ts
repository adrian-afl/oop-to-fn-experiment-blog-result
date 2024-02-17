import { FastifyReply } from "fastify";
import { z } from "zod";

import { AuthorizedFastifyRequestWithAppData } from "@app/api";
import { getUserInvitationCodes } from "@app/modules/user/logic/invitationCodes/getUserInvitationCodes";
import { HttpMethods } from "@app/util/api/HttpMethods";
import { AuthorizedController } from "@app/util/api/registerAuthorizedController";

const outputSchema = z.object({
  id: z.string(),
  userName: z.string(),
  roles: z.array(z.string()),
  invitationCodes: z.array(z.string()),
});

export const meController: AuthorizedController<typeof outputSchema> = {
  method: HttpMethods.Get,
  path: "/me",
  requiredRoles: [],

  outputSchema,
  queryParamsSchema: z.unknown(),
  bodySchema: z.unknown(),
  pathParamsSchema: z.unknown(),

  execute: async (
    req: AuthorizedFastifyRequestWithAppData,
    _rep: FastifyReply
  ) => {
    return {
      id: req.user.id,
      roles: req.user.roles,
      userName: req.user.userName,
      invitationCodes: (await getUserInvitationCodes(req.user)).map(
        (i) => i.code
      ),
    };
  },
};
