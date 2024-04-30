export interface BaseResponse {
  success: boolean;
  error?: string;
}

export interface BaseDataResponse<T> extends BaseResponse {
  data?: T;
}
