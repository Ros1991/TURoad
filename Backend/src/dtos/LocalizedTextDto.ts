import { IsNotEmpty, IsInt, IsOptional, IsString } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateLocalizedTextDto implements IDto {
  @IsNotEmpty()
  @IsInt()
  referenceId!: number;

  @IsNotEmpty()
  @IsString()
  languageCode!: string;

  @IsNotEmpty()
  @IsString()
  textContent!: string;
}

// UPDATE
export class UpdateLocalizedTextDto implements IDto {
  @IsOptional()
  @IsInt()
  referenceId?: number;

  @IsOptional()
  @IsString()
  languageCode?: string;

  @IsOptional()
  @IsString()
  textContent?: string;
}

// RESPONSE
export class LocalizedTextResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  textId!: number;
  
  @IsInt()
  referenceId!: number;
  
  @IsString()
  languageCode!: string;
  
  @IsString()
  textContent!: string;
}
