import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateLocationDto implements IDto {
  @IsNotEmpty()
  @IsInt()
  cityId!: number;

  @IsNotEmpty()
  @IsInt()
  nameTextRefId!: number;

  @IsOptional()
  @IsInt()
  descriptionTextRefId?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsInt()
  typeId?: number;
}

// UPDATE
export class UpdateLocationDto implements IDto {
  @IsOptional()
  @IsInt()
  cityId?: number;

  @IsOptional()
  @IsInt()
  nameTextRefId?: number;

  @IsOptional()
  @IsInt()
  descriptionTextRefId?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsInt()
  typeId?: number;
}

// RESPONSE
export class LocationResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  locationId!: number;
  
  @IsInt()
  cityId!: number;
  
  @IsInt()
  nameTextRefId!: number;
  
  @IsOptional()
  @IsInt()
  descriptionTextRefId?: number;
  
  @IsOptional()
  @IsNumber()
  latitude?: number;
  
  @IsOptional()
  @IsNumber()
  longitude?: number;
  
  @IsOptional()
  @IsInt()
  typeId?: number;
  
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
