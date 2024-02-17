import { prisma } from "@app/modules/prisma/prisma";

export async function canUseInvitationCode(code: string): Promise<boolean> {
  const codeExists = await prisma.invitationCode.count({
    where: {
      code,
      usedAt: null,
    },
  });
  return codeExists !== 0;
}
