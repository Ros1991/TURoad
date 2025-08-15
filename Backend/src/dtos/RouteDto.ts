import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateRouteDto implements IDto {
  @IsNotEmpty()
  @IsInt()
  titleTextRefId!: number;

  @IsOptional()
  @IsInt()
  descriptionTextRefId?: number;

  @IsOptional()
  @IsInt()
  whatToObserveTextRefId?: number;
}

// UPDATE
export class UpdateRouteDto implements IDto {
  @IsOptional()
  @IsInt()
  titleTextRefId?: number;

  @IsOptional()
  @IsInt()
  descriptionTextRefId?: number;

  @IsOptional()
  @IsInt()
  whatToObserveTextRefId?: number;
}

// RESPONSE
export class RouteResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  routeId!: number;
  
  @IsInt()
  titleTextRefId!: number;
  
  @IsOptional()
  @IsInt()
  descriptionTextRefId?: number;
  
  @IsOptional()
  @IsInt()
  whatToObserveTextRefId?: number;
  
  @IsDateString()
  createdAt!: Date;
  
  @IsDateString()
  updatedAt!: Date;
  
  @IsOptional()
  @IsDateString()
  deletedAt?: Date | null;
  
  @IsBoolean()
  isDeleted!: boolean;
}
