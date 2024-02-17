import * as jsonwebtoken from "jsonwebtoken";

import { config } from "@app/config";
import { prisma } from "@app/modules/prisma/prisma";
import { TokenData } from "@app/modules/user/logic/authentication/generateToken";

export async function verify(token: string): Promise<boolean> {
  try {
    const tokenData = jsonwebtoken.verify(token, config.auth.jwtSecret, {
      algorithms: ["HS512"],
      audience: "default",
      issuer: "gravity",
      allowInvalidAsymmetricKeyTypes: false,
      ignoreExpiration: false,
      ignoreNotBefore: false,
    }) as TokenData;
    await prisma.user.updateMany({
      where: { id: tokenData.id, verifiedAt: null },
      data: { verifiedAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}
