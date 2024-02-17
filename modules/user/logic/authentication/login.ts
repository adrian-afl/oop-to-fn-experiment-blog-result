import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

import { prisma } from "@app/modules/prisma/prisma";
import { generateToken } from "@app/modules/user/logic/authentication/generateToken";
import { logDebug } from "@app/util/logger";

export interface LoginData {
  userName: string;
  password: string;
}

export async function login(data: LoginData): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: {
      userName: data.userName,
      verifiedAt: { not: null },
    },
  });
  if (user === null) {
    // prevent time attacks
    await bcrypt.compare(data.password, crypto.randomUUID());
    return null;
  }
  const validationResult = await bcrypt.compare(
    data.password,
    user.passwordHash
  );
  if (!validationResult) {
    return null;
  }
  logDebug(`${data.userName} logged in`);
  return generateToken(
    {
      id: user.id,
    },
    "7d" // hilariously long
  );
}
