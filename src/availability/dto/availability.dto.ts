import { IsNotEmpty, IsDateString, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetAvailabilityDto {
  @ApiPropertyOptional({ example: '60d5ecb8b3945a278c8574e8', description: 'ID of the court' })
  @IsOptional()
  @IsString()
  courtId?: string;

  @ApiPropertyOptional({ example: '60d5ecb8b3945a278c8574e8', description: 'ID of the venue' })
  @IsOptional()
  @IsString()
  venueId?: string;

  @ApiProperty({ example: '2024-06-20', description: 'Date to check availability' })
  @IsNotEmpty({ message: 'Ngày kiểm tra không được để trống' })
  @IsDateString({}, { message: 'Định dạng ngày không hợp lệ (YYYY-MM-DD)' })
  date: string;

  @ApiPropertyOptional({ example: 'user123', description: 'User ID or session identifier' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class BlockAvailabilityDto {
  @ApiProperty({ example: '60d5ecb8b3945a278c8574e8', description: 'ID of the court' })
  @IsNotEmpty({ message: 'ID sân không được để trống' })
  @IsString()
  courtId: string;

  @ApiProperty({ example: '2024-06-20T08:00:00.000Z', description: 'Start datetime' })
  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  @IsDateString()
  startDatetime: string;

  @ApiProperty({ example: '2024-06-20T10:00:00.000Z', description: 'End datetime' })
  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  @IsDateString()
  endDatetime: string;

  @ApiProperty({ example: 'Bảo trì sân', description: 'Reason for blocking' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class LockSlotDto {
  @ApiProperty({ example: '60d5ecb8b3945a278c8574e8', description: 'ID of the court' })
  @IsNotEmpty({ message: 'ID sân không được để trống' })
  @IsString()
  courtId: string;

  @ApiProperty({ example: '2024-06-20', description: 'Date to lock' })
  @IsNotEmpty({ message: 'Ngày không được để trống' })
  @IsString()
  date: string;

  @ApiProperty({ example: '08:00', description: 'Start time' })
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: 'user123', description: 'User ID or session identifier' })
  @IsNotEmpty({ message: 'User ID không được để trống' })
  @IsString()
  userId: string;
}
