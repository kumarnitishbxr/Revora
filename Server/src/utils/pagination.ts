export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const getPagination = (
  pageQuery?: string | number,
  limitQuery?: string | number
): PaginationOptions => {
  let page = typeof pageQuery === "string" ? parseInt(pageQuery, 10) : Number(pageQuery) || 1;
  let limit = typeof limitQuery === "string" ? parseInt(limitQuery, 10) : Number(limitQuery) || 10;

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100; // Enforce maximum 100 per request

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit,
  };
};

export const formatPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
