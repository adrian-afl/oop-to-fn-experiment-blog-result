import { FastifyRequest } from "fastify";

import { getCurrentUserForToken } from "@app/modules/user/logic/authentication/getCurrentUserForToken";

import { User } from "@prisma/client";

export async function getCurrentUserForRequest(
  request: FastifyRequest
): Promise<User | null> {
  const tokenHeader = request.headers.authorization ?? null;
  const prefix = "Bearer ";
  if (!tokenHeader?.startsWith(prefix)) {
    return null;
  }
  const token = tokenHeader.substring(prefix.length);
  return getCurrentUserForToken(token);
}
