export interface PaginationType {
  total: number;
  count: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
}

export interface MetaType {
  timestamp: string;
  apiVersion: string;
}

export interface ApiResponseType<T = any> {
  statusCode: number;
  message: string;
  data: T;
  meta: MetaType;
}

export interface ApiResponsePaginationType<T = any> {
  statusCode: number;
  message: string;
  data: T[];
  pagination: PaginationType;
  meta: MetaType;
}

function createMeta(): MetaType {
  return {
    timestamp: new Date().toISOString(),
    apiVersion: 'v1.2',
  };
}

export function createApiResponse<T = any>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
): ApiResponseType<T> {
  return {
    statusCode,
    message,
    data,
    meta: createMeta(),
  };
}

export function createPaginatedResponse<T = any>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success',
  statusCode: number = 200,
): ApiResponsePaginationType<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    statusCode,
    message,
    data,
    pagination: {
      total,
      count: data.length,
      perPage: limit,
      currentPage: page,
      totalPages: totalPages,
    },
    meta: createMeta(),
  };
}
