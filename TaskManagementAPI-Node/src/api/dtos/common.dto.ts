/**
 * Common Data Transfer Objects
 * Shared across all API endpoints
 */

/**
 * Standard error response structure
 */
export interface ErrorResponseDto {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: Array<{
    field: string;
    message: string;
  }>;
  errors?: string[];
}

/**
 * Standard success response wrapper
 */
export interface SuccessResponseDto<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Pagination request parameters
 */
export interface PaginationRequestDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination response metadata
 */
export interface PaginationMetaDto {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponseDto<T> {
  success: true;
  data: T[];
  pagination: PaginationMetaDto;
}
