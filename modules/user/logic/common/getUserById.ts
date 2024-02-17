import { prisma } from "@app/modules/prisma/prisma";

import { User } from "@prisma/client";

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: {
      id,
    },
  });
}
