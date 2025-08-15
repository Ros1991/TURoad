import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString, IsString } from 'class-validator';
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

  @IsNotEmpty()
  @IsDateString()
  eventDate!: Date;

  @IsNotEmpty()
  @IsString()
  eventTime!: string;
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
  @IsDateString()
  eventDate?: Date;

  @IsOptional()
  @IsString()
  eventTime?: string;
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
  
  @IsDateString()
  eventDate!: Date;
  
  @IsString()
  eventTime!: string;
  
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
