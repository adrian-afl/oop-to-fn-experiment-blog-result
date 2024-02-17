import { prisma } from "@app/modules/prisma/prisma";
import { Pagination } from "@app/util/createPagination";

import { Prisma, User } from "@prisma/client";

export interface ListUsersData {
  searchByUserName: string | null;
  pagination: Pagination;
}

export async function listUsers(data: ListUsersData): Promise<User[]> {
  const where: Prisma.UserWhereInput = {};
  if (data.searchByUserName) {
    where.userName = {
      contains: data.searchByUserName,
      mode: "insensitive",
    };
  }
  return prisma.user.findMany({
    where,
    skip: data.pagination.skip,
    take: data.pagination.take,
  });
}
