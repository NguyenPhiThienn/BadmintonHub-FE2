import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsMongoId, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePromotionDto {
  @ApiPropertyOptional({ example: '601f191e810c19729de860ea', description: 'Để trống nếu là Mã KM Toàn hệ thống (Admin)' })
  @IsOptional()
  @IsMongoId()
  venueId?: string;

  @ApiProperty({ example: 'MUAHE2024' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 10, description: 'Phần trăm giảm giá (VD: 10)' })
  @IsNotEmpty()
  @IsNumber()
  discount_percentage: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  max_discount_amount?: number;

  @ApiProperty({ example: '2024-06-01T00:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  start_date: string | Date;

  @ApiProperty({ example: '2024-06-30T23:59:59Z' })
  @IsNotEmpty()
  @IsDateString()
  end_date: string | Date;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) { }
