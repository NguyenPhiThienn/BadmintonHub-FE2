import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsMongoId, Matches, IsOptional } from 'class-validator';

export class CreatePricingDto {
  @ApiProperty({ example: '601f191e810c19729de860ea' })
  @IsNotEmpty()
  @IsMongoId()
  venueId: string;

  @ApiPropertyOptional({ example: 1, description: '0-6 cho thứ 2 đến CN, để trống cho ngày lễ' })
  @IsOptional()
  @IsNumber()
  day_of_week?: number;

  @ApiProperty({ example: '05:00' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$|^24:00$/, { message: 'startTime must be HH:mm or 24:00' })
  startTime: string;

  @ApiProperty({ example: '12:00' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$|^24:00$/, { message: 'endTime must be HH:mm or 24:00' })
  endTime: string;

  @ApiProperty({ example: 50000 })
  @IsNotEmpty()
  @IsNumber()
  price_per_hour: number;

  @ApiPropertyOptional({ example: 'Giờ cao điểm', description: 'Tên hoặc nhãn của khung giá (tùy chọn)' })
  @IsOptional()
  label?: string;
}

export class UpdatePricingDto extends PartialType(CreatePricingDto) { }
