export type ContentResponse<T = unknown> = {
  success: boolean;
  data?: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  status?: number;
  message?: string;
};
