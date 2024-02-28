import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 10, description: 'Number of items in current page' })
  count: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  perPage: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  currentPage: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages: number;
}

export class MetaDto {
  @ApiProperty({ example: '2023-10-27T10:00:00Z', description: 'Response timestamp' })
  timestamp: string;

  @ApiProperty({ example: 'v1.2', description: 'API version' })
  apiVersion: string;
}

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Success',
  })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ description: 'Response metadata', type: MetaDto })
  meta: MetaDto;
}

export class ApiResponsePaginationDto<T = any> {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Success',
  })
  message: string;

  @ApiProperty({ description: 'Response data array' })
  data: T[];

  @ApiProperty({ description: 'Pagination information', type: PaginationDto })
  pagination: PaginationDto;

  @ApiProperty({ description: 'Response metadata', type: MetaDto })
  meta: MetaDto;
}
