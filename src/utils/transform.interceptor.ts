import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  pagination?: {
    total: number;
    count: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
  };
  meta: {
    timestamp: string;
    apiVersion: string;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode || 200;

        // If the response is already in the correct format, return it
        if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'message' in data &&
          'data' in data &&
          'meta' in data
        ) {
          return data;
        }

        // If the response has pagination, format it accordingly
        if (
          data &&
          typeof data === 'object' &&
          'pagination' in data &&
          'data' in data
        ) {
          return {
            statusCode,
            message: data.message || 'Success',
            data: data.data,
            pagination: data.pagination,
            meta: {
              timestamp: new Date().toISOString(),
              apiVersion: 'v1.2',
            },
          };
        }

        // Default transformation
        return {
          statusCode,
          message: 'Success',
          data: data,
          meta: {
            timestamp: new Date().toISOString(),
            apiVersion: 'v1.2',
          },
        };
      }),
    );
  }
}
