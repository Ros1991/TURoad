import { IsNotEmpty, IsString, Length, IsOptional, IsBoolean, IsUrl, IsInt, IsEmail, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { IDto } from '../core/base/BaseDto';

// CREATE
export class CreateUserDto implements IDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
    message: 'A senha deve conter pelo menos uma letra e um número',
  })
  password!: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  isAdmin?: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  enabled?: boolean = true;
}

// UPDATE
export class UpdateUserDto implements IDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(6, 100)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
    message: 'A senha deve conter pelo menos uma letra e um número',
  })
  password?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  isAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  enabled?: boolean;
}

// RESPONSE (User entity doesn't have createdAt/updatedAt)
export class UserResponseDto implements IDto {
  @IsInt()
  id!: number;

  @IsInt()
  userId!: number;
  
  @IsEmail()
  email!: string;
  
  @IsOptional()
  @IsString()
  firstName?: string;
  
  @IsOptional()
  @IsString()
  lastName?: string;
  
  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;
  
  @IsBoolean()
  isAdmin!: boolean;
  
  @IsBoolean()
  enabled!: boolean;
}

export class UserProfileDto implements IDto {
  userId!: number;
  email!: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  isAdmin!: boolean;
  enabled!: boolean;
  favoriteRoutesCount!: number;
  favoriteCitiesCount!: number;
  visitedRoutesCount!: number;
}
