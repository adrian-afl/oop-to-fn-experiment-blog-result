import { prisma } from "@app/modules/prisma/prisma";
import { hashEmail } from "@app/modules/user/logic/common/hashEmail";

import { User } from "@prisma/client";

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: {
      emailHash: hashEmail(email),
    },
  });
}
