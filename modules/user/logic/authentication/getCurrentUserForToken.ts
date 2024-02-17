import * as jsonwebtoken from "jsonwebtoken";

import { config } from "@app/config";
import { TokenData } from "@app/modules/user/logic/authentication/generateToken";
import { getUserById } from "@app/modules/user/logic/common/getUserById";

import { User } from "@prisma/client";

export async function getCurrentUserForToken(
  token: string
): Promise<User | null> {
  try {
    const tokenData = jsonwebtoken.verify(token, config.auth.jwtSecret, {
      algorithms: ["HS512"],
      audience: "default",
      issuer: "gravity",
      allowInvalidAsymmetricKeyTypes: false,
      ignoreExpiration: false,
      ignoreNotBefore: false,
    }) as TokenData;
    const user = await getUserById(tokenData.id);
    if (!user?.verifiedAt) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
