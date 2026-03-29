export interface ApiResponse<T> {
  success: boolean;
  data: T;
  path?: string;
  timestamp: string;
}


export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  errors?: unknown;
  path: string;
  timestamp: string;
}
