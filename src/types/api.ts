/**
 * Shared API response types used across the application.
 */

/** Standard API error response */
export interface ApiErrorResponse {
  error: string;
}

/** Standard API success response with data */
export interface ApiSuccessResponse<T> {
  success: true;
  data?: T;
  message?: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

/** Hook state for data fetching */
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Generic filter/sort params */
export interface ListParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: SortDirection;
  search?: string;
}
