export interface PaginationResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginates an in-memory list with boundary clamping and status flags
 */
export function paginateItems<T>(
  items: T[],
  requestedPage = 1,
  pageSize = 12
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.max(1, Math.min(requestedPage, totalPages));

  const startIndex = (page - 1) * pageSize;
  const paginated = items.slice(startIndex, startIndex + pageSize);

  return {
    items: paginated,
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
