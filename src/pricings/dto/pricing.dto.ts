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
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'startTime must be HH:mm' })
  startTime: string;

  @ApiProperty({ example: '12:00' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'endTime must be HH:mm' })
  endTime: string;

  @ApiProperty({ example: 50000 })
  @IsNotEmpty()
  @IsNumber()
  price_per_hour: number;
}

export class UpdatePricingDto extends PartialType(CreatePricingDto) { }
