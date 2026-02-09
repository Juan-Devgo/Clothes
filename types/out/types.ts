export type ContentResponse<T = unknown> = {
  success: boolean;
  data?: T;
  status?: number;
  message?: string;
};
