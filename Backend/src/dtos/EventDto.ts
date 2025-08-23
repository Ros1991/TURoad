import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString, IsString, IsUrl } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateEventDto implements IDto {
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
  @IsInt()
  locationTextRefId?: number;

  @IsNotEmpty()
  @IsDateString()
  eventDate!: Date;

  @IsOptional()
  @IsInt()
  timeTextRefId?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

// UPDATE
export class UpdateEventDto implements IDto {
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
  @IsInt()
  locationTextRefId?: number;

  @IsOptional()
  @IsDateString()
  eventDate?: Date;

  @IsOptional()
  @IsInt()
  timeTextRefId?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

// City nested DTO for responses
export class CityNestedDto {
  @IsInt()
  cityId!: number;
  
  @IsInt()
  nameTextRefId!: number;
  
  @IsString()
  state!: string;
  
  @IsOptional()
  @IsString()
  name?: string;
}

// RESPONSE
export class EventResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  eventId!: number;
  
  @IsInt()
  cityId!: number;
  
  @IsInt()
  nameTextRefId!: number;
  
  @IsOptional()
  @IsInt()
  descriptionTextRefId?: number;
  
  @IsOptional()
  @IsInt()
  locationTextRefId?: number;
  
  @IsDateString()
  eventDate!: Date;
  
  @IsOptional()
  @IsInt()
  timeTextRefId?: number;
  
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
  
  @IsOptional()
  city?: CityNestedDto;
  
  // Localized fields
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsString()
  location?: string;
  
  @IsOptional()
  @IsString()
  time?: string;
  
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
