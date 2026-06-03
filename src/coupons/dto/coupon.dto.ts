import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsMongoId, IsOptional, IsEnum, IsString, IsDateString, Min } from 'class-validator';
import { DiscountType, CouponStatus } from '../schemas/coupon.schema';

export class CreateCouponDto {
  @ApiProperty({ example: 'GIAM50K' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: '601f191e810c19729de860ea' })
  @IsOptional()
  @IsMongoId()
  venueId?: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.FIXED_AMOUNT })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 50000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  discountValue: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ example: 30000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxDiscountAmount?: number;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-06-30T23:59:59.000Z' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  usageLimit: number;
}

export class UpdateCouponDto extends PartialType(CreateCouponDto) {
  @ApiPropertyOptional({ enum: CouponStatus })
  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;
}
