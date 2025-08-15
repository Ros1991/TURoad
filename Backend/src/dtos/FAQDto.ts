import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString, IsString } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateFAQDto implements IDto {
  @IsNotEmpty()
  @IsString()
  question!: string;

  @IsNotEmpty()
  @IsString()
  answer!: string;
}

// UPDATE
export class UpdateFAQDto implements IDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;
}

// RESPONSE
export class FAQResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  faqId!: number;
  
  @IsString()
  question!: string;
  
  @IsString()
  answer!: string;
  
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
