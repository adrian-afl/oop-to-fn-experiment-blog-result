import * as jsonwebtoken from "jsonwebtoken";

import { config } from "@app/config";

export interface TokenData {
  id: string;
}

export function generateToken(data: TokenData, expiresIn: string): string {
  return jsonwebtoken.sign(data, config.auth.jwtSecret, {
    expiresIn,
    algorithm: "HS512",
    allowInsecureKeySizes: false,
    audience: "default",
    issuer: "gravity",
    allowInvalidAsymmetricKeyTypes: false,
  });
}
