import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Nguyen Van B' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '0901234568' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'example@mail.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.PLAYER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'password123' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Vi phạm quy định sử dụng' })
  @IsOptional()
  @IsString()
  blockedReason?: string;
}
