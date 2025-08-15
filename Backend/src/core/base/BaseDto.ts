import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';


export interface IDto {
}
/**
 * Generic Pagination DTO for requests - can be used across all entities
 */
export class PaginationRequestDto {
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;

  @IsOptional()
  @IsString({ message: 'Campo de ordenação deve ser uma string' })
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'Ordem deve ser ASC ou DESC' })
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  search?: any;
}

/**
 * Generic Pagination DTO for responses - contains pagination metadata
 */
export class PaginationResponseDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}

/**
 * Generic Filter DTO base - provides common search functionality
 */
export class BaseFilterDto {
  @IsOptional()
  @IsString({ message: 'Search deve ser uma string' })
  search?: string;
}

/**
 * Generic List Request DTO - combines pagination with filters
 */
export class ListRequestDto<T extends BaseFilterDto> {
  pagination: PaginationRequestDto;
  filters: T;

  constructor(pagination: PaginationRequestDto = new PaginationRequestDto(), filters: T) {
    this.pagination = pagination;
    this.filters = filters;
  }
}

/**
 * Generic List Response DTO - standardized response format with nested pagination
 */
export class ListResponseDto<T> {
  items: T[];
  pagination: PaginationResponseDto;

  constructor(
    items: T[],
    total: number,
    page: number,
    limit: number
  ) {
    this.items = items;
    this.pagination = new PaginationResponseDto(page, limit, total);
  }
}
