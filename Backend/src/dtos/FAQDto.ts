import { IsNotEmpty, IsInt, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateFAQDto implements IDto {
  @IsNotEmpty()
  @IsInt()
  questionTextRefId!: number;

  @IsNotEmpty()
  @IsInt()
  answerTextRefId!: number;
}

// UPDATE
export class UpdateFAQDto implements IDto {
  @IsOptional()
  @IsInt()
  questionTextRefId?: number;

  @IsOptional()
  @IsInt()
  answerTextRefId?: number;
}

// RESPONSE
export class FAQResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  faqId!: number;
  
  @IsInt()
  questionTextRefId!: number;
  
  @IsInt()
  answerTextRefId!: number;
  
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
