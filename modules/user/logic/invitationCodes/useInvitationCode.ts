import { prisma } from "@app/modules/prisma/prisma";

export async function useInvitationCode(code: string): Promise<void> {
  await prisma.invitationCode.updateMany({
    where: { code },
    data: {
      usedAt: new Date(),
    },
  });
}
