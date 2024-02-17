import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

import { prisma } from "@app/modules/prisma/prisma";
import { hashEmail } from "@app/modules/user/logic/common/hashEmail";
import { generateInvitationCodes } from "@app/modules/user/logic/invitationCodes/generateInvitationCodes";
import { logInfo } from "@app/util/logger";

import { User } from "@prisma/client";

export interface CreateUserData {
  userName: string;
  email: string;
  password: string;
  roles: string[];
  invitationCodesCount: number;
}

export async function createUser(data: CreateUserData): Promise<User> {
  const id = crypto.randomUUID();
  const user = await prisma.user.create({
    data: {
      id,
      userName: data.userName,
      emailHash: hashEmail(data.email),
      roles: data.roles,
      passwordHash: await bcrypt.hash(data.password, 10),
      invitationCodes: {
        create: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      verifiedAt: new Date(),
      disabledAt: null,
    },
  });
  await generateInvitationCodes(user, data.invitationCodesCount);
  logInfo(`${data.userName} created`);
  return user;
}
