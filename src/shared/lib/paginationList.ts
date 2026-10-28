export interface PaginationResult<T> {
  paginatedItems: T[];
  totalPages: number;
}

export function getPaginatedData<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number,
): PaginationResult<T> {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  return {
    paginatedItems,
    totalPages,
  };
}
