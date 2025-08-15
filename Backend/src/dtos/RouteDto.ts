import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString, IsString, IsUrl } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateRouteDto implements IDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  whatToObserve?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

// UPDATE
export class UpdateRouteDto implements IDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  whatToObserve?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

// RESPONSE
export class RouteResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  routeId!: number;
  
  @IsString()
  title!: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsString()
  whatToObserve?: string;
  
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
  
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
