import { prisma } from "@app/modules/prisma/prisma";

import { InvitationCode, User } from "@prisma/client";

export async function getUserInvitationCodes(
  owner: User
): Promise<InvitationCode[]> {
  return prisma.invitationCode.findMany({
    where: { ownerId: owner.id, usedAt: null },
  });
}
