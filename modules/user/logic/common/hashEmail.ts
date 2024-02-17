import * as crypto from "crypto";

const emailSalt = "email-salt-very-secure";

export const hashEmail = (email: string): string =>
  crypto
    .createHash("sha256")
    .update(email + emailSalt)
    .digest("hex");
