import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

import { prisma } from "@app/modules/prisma/prisma";
import { getUserByEmail } from "@app/modules/user/logic/common/getUserByEmail";
import { getUserByUserName } from "@app/modules/user/logic/common/getUserByUserName";
import { hashEmail } from "@app/modules/user/logic/common/hashEmail";
import { canUseInvitationCode } from "@app/modules/user/logic/invitationCodes/canUseInvitationCode";
import { generateInvitationCodes } from "@app/modules/user/logic/invitationCodes/generateInvitationCodes";
import { useInvitationCode } from "@app/modules/user/logic/invitationCodes/useInvitationCode";
import { sendVerificationEmail } from "@app/modules/user/logic/registration/sendVerificationEmail";
import { UserError } from "@app/util/exception/UserError";
import { logInfo } from "@app/util/logger";

export interface RegisterData {
  userName: string;
  email: string;
  password: string;
  roles: string[];
  invitationCode: string;
}

export async function register(data: RegisterData): Promise<void> {
  const existingByEmail = await getUserByEmail(data.email);
  if (existingByEmail) {
    throw new UserError("Email in use");
  }
  const existingByUserName = await getUserByUserName(data.userName);
  if (existingByUserName) {
    throw new UserError("UserName in use");
  }

  if (!(await canUseInvitationCode(data.invitationCode))) {
    throw new UserError("Invalid invitation code");
  }

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
      verifiedAt: null,
      disabledAt: null,
    },
  });
  await useInvitationCode(data.invitationCode);
  await generateInvitationCodes(user, 4);
  await sendVerificationEmail(data.email, id);
  logInfo(`${data.userName} registered`);
}
