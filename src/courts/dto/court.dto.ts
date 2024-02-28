import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { CourtStatus } from '../schemas/court.schema';

export class CreateCourtDto {
  @ApiProperty({ example: '601f191e810c19729de860ea' })
  @IsNotEmpty()
  @IsMongoId()
  venueId: string;

  @ApiProperty({ example: 'Sân 1' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Thảm PVC' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ enum: CourtStatus, example: CourtStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(CourtStatus)
  status?: CourtStatus;
}

export class UpdateCourtDto extends PartialType(CreateCourtDto) { }
