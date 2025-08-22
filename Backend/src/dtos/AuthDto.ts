import { IsNotEmpty, IsString, Length, IsOptional, IsEmail, Matches } from 'class-validator';
import { IDto } from '../core/base/BaseDto';

export class LoginDto implements IDto {
  @IsNotEmpty()
  @IsString()
  emailOrUsername!: string; // Can be email or username

  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class RegisterDto implements IDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 255)
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
  @IsString()
  profilePictureUrl?: string;
}

// Note: Forgot/Reset password functionality can be implemented now since User entity has email field
export class ChangePasswordDto implements IDto {
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 255)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
    message: 'A senha deve conter pelo menos uma letra e um número',
  })
  newPassword!: string;
}

export class RefreshTokenDto implements IDto {
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}

export class AuthResponseDto implements IDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    enabled: boolean;
  };
  expiresIn!: string;
}

export class TokenResponseDto implements IDto {
  accessToken!: string;
  expiresIn!: string;
}

