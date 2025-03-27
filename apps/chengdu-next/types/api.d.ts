declare module '@/types/api' {
  export interface ApiResponse<T> {
    code?: number;
    data?: T;
  }

  export interface ListResponse<T> {
    list: T[];
  }

  export interface PageResponse<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  }
}