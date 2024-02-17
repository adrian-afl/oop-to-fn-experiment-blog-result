import { z } from "zod";

import { UserRoles } from "@app/modules/user/logic/common/UserRoles";

import { User } from "@prisma/client";

export const userOutput = z.object({
  id: z.string(),
  userName: z.string(),
  roles: z.array(z.enum(Object.values(UserRoles) as [string, ...string[]])),
  createdAt: z.string(),
  updatedAt: z.string(),
  verifiedAt: z.string().nullable(),
  disabledAt: z.string().nullable(),
});

export function transformUser(user: User): z.infer<typeof userOutput> {
  return {
    id: user.id,
    userName: user.userName,
    roles: user.roles,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    verifiedAt: user.verifiedAt?.toISOString() ?? null,
    disabledAt: user.disabledAt?.toISOString() ?? null,
  };
}
