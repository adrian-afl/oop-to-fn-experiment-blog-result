export interface Pagination {
  skip: number;
  take: number;
}

export const createPagination = (data: {
  skip: number;
  take: number;
  limit?: number;
}): Pagination => {
  return {
    skip: Math.floor(data.skip),
    take: Math.floor(Math.min(data.take, data.limit ?? 50)),
  };
};
