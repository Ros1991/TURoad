import { PaginationRequestDto } from "./BaseDto";

// BaseVO para requisição de paginação
export class PaginationRequestVO {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: any;
  
    constructor(dto: PaginationRequestDto) {
      this.page = dto.page && dto.page > 0 ? dto.page : 1;
      this.limit = dto.limit && dto.limit > 0 ? dto.limit : 10;
      this.sortBy = dto.sortBy;
      this.sortOrder = dto.sortOrder ?? 'ASC';
      this.search = dto.search;
    }
  }
  
  // BaseVO para resposta de paginação
  export class PaginationResponseVO {
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
  
    static fromRequestAndTotal(requestVO: PaginationRequestVO, total: number): PaginationResponseVO {
      return new PaginationResponseVO(requestVO.page, requestVO.limit, total);
    }
  }

  export class ListResponseVO<T> {
    items: T[];
    pagination: PaginationResponseVO;
  
    constructor(items: T[], requestVO: PaginationRequestVO, total: number) {
      this.items = items;
      this.pagination = PaginationResponseVO.fromRequestAndTotal(requestVO, total);
    }
  }