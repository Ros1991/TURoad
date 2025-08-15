import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString, IsString, IsUrl } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateEventDto implements IDto {
  @IsNotEmpty()
  @IsInt()
  cityId!: number;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  eventDate!: Date;

  @IsNotEmpty()
  @IsString()
  eventTime!: string;

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
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  eventDate?: Date;

  @IsOptional()
  @IsString()
  eventTime?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

// RESPONSE
export class EventResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  eventId!: number;
  
  @IsInt()
  cityId!: number;
  
  @IsString()
  name!: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsDateString()
  eventDate!: Date;
  
  @IsString()
  eventTime!: string;
  
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
