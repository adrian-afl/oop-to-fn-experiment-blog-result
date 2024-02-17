import * as crypto from "crypto";

import { prisma } from "@app/modules/prisma/prisma";

import { InvitationCode, User } from "@prisma/client";

export async function generateInvitationCodes(
  owner: User,
  count: number
): Promise<InvitationCode[]> {
  const result: InvitationCode[] = [];
  for (let i = 0; i < count; i++) {
    let code = generateCodeString();
    while (await doesCodeAlreadyExist(code)) {
      code = generateCodeString();
    }
    const entity = await prisma.invitationCode.create({
      data: {
        id: crypto.randomUUID(),
        code,
        usedAt: null,
        ownerId: owner.id,
      },
    });
    result.push(entity);
  }
  return result;
}

async function doesCodeAlreadyExist(code: string): Promise<boolean> {
  const codeExists = await prisma.invitationCode.count({
    where: {
      code,
      usedAt: null,
    },
  });
  return codeExists !== 0;
}

function generateCodeString(): string {
  return `${crypto.randomBytes(4).toString("hex")}-${crypto
    .randomBytes(4)
    .toString("hex")}`;
}
