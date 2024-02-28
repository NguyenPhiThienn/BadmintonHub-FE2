import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Matches, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CourtDto {
  @ApiProperty({ example: 'Sân số 1' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Sàn gỗ' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ example: 'AVAILABLE' })
  @IsNotEmpty()
  @IsString()
  status: string;
}

export class CreateVenueDto {
  @ApiProperty({ example: 'Sân Cầu Lông A' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '123 Đường B, Quận C' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: 10.8231 })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 106.6297 })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ example: 'Sân đẹp, thoáng mát' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '05:00' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'openTime must be HH:mm' })
  openTime: string;

  @ApiProperty({ example: '22:00' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'closeTime must be HH:mm' })
  closeTime: string;

  @ApiProperty({ example: 100000 })
  @IsNotEmpty()
  @IsNumber()
  pricePerHour: number;

  @ApiPropertyOptional({ type: [CourtDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourtDto)
  courts?: CourtDto[];
}

export class UpdateVenueDto extends PartialType(CreateVenueDto) {}
