import { prisma } from "@app/modules/prisma/prisma";
import { UserRoles } from "@app/modules/user/logic/common/UserRoles";

import { User } from "@prisma/client";

export interface RemoveRoleFromUserData {
  role: UserRoles;
  user: User;
}

export async function removeRoleFromUser(
  data: RemoveRoleFromUserData
): Promise<User> {
  if (data.user.roles.includes(data.role)) {
    const newRoles = data.user.roles.filter((r) => r !== (data.role as string));
    await prisma.user.update({
      where: {
        id: data.user.id,
      },
      data: {
        roles: newRoles,
      },
    });
    return { ...data.user, roles: newRoles };
  } else {
    return data.user;
  }
}
