import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'a@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0901234567' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.PLAYER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty({ example: 'a@example.com', description: 'Email hoặc số điện thoại' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'Password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123' })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiPropertyOptional({ example: 'NewPassword123' })
  @IsOptional()
  @IsString()
  confirmPassword?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUz...' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'a@example.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}

