import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

import { prisma } from "@app/modules/prisma/prisma";
import { UserRoles } from "@app/modules/user/logic/common/UserRoles";
import { hashEmail } from "@app/modules/user/logic/common/hashEmail";

import { User } from "@prisma/client";

export async function getSystemUser(): Promise<User> {
  const user = await prisma.user.findFirst({
    where: {
      roles: {
        has: UserRoles.AutomaticSystemAdmin,
      },
    },
  });
  if (!user) {
    return prisma.user.create({
      data: {
        roles: [UserRoles.AutomaticSystemAdmin, UserRoles.SystemAdmin],
        userName: "SYSTEM",
        id: crypto.randomUUID(),
        emailHash: hashEmail("system@example.space"),
        passwordHash: await bcrypt.hash(
          crypto.randomBytes(16).toString("hex"),
          10
        ),
        invitationCodes: {
          create: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        verifiedAt: new Date(),
        disabledAt: null,
      },
    });
  } else {
    return user;
  }
}
