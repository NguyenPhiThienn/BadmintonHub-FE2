import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'example@mail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0901234567' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PLAYER })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
