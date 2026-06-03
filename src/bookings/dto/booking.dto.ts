import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional, IsDateString, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../schemas/booking.schema';

export class BookingDetailDto {
  @ApiProperty({ example: '60d5ecb8b3945a278c8574e8', description: 'ID of the court' })
  @IsNotEmpty()
  @IsString()
  courtId: string;

  @ApiProperty({ example: '2024-06-20', description: 'Booking date' })
  @IsNotEmpty()
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ example: '08:00', description: 'Start time (HH:mm)' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '10:00', description: 'End time (HH:mm)' })
  @IsNotEmpty()
  @IsString()
  endTime: string;
}

export class CreateBookingDto {
  @ApiProperty({ example: '60d5ecb8b3945a278c8574e9', description: 'ID of the venue' })
  @IsNotEmpty()
  @IsString()
  venueId: string;

  @ApiProperty({ example: '60d5ecb8b3945a278c8574f0', description: 'ID of the promotion', required: false })
  @IsOptional()
  @IsString()
  promotionId?: string;

  @ApiProperty({ example: '60d5ecb8b3945a278c8574f0', description: 'ID of the coupon', required: false })
  @IsOptional()
  @IsString()
  couponId?: string;

  @ApiProperty({ type: [BookingDetailDto], description: 'List of booking details' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
   @Type(() => BookingDetailDto)
  details: BookingDetailDto[];

  @ApiProperty({ example: 'Khách quen đặt qua Zalo', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  isWeekly?: boolean;

  @ApiProperty({ example: 'Nguyen Van A', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ example: 'customer@example.com', required: false })
  @IsOptional()
  @IsString()
  customerEmail?: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
  @IsNotEmpty()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiProperty({ example: 'Lý do hủy đơn...', required: false })
  @IsOptional()
  @IsString()
  cancelReason?: string;

  @ApiProperty({ example: 'SUCCESS', required: false })
  @IsOptional()
  @IsString()
  paymentStatus?: string;
}

export class RefundRequestDto {
  @ApiProperty({ example: 'Vietcombank' })
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @ApiProperty({ example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @ApiProperty({ example: 'NGUYEN VAN A' })
  @IsNotEmpty()
  @IsString()
  accountName: string;

  @ApiProperty({ example: 'Tôi bận đột xuất' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class ApplyCouponDto {
  @ApiProperty({ example: 'SALE20' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: '60d5ecb8b3945a278c8574e9' })
  @IsNotEmpty()
  @IsString()
  venueId: string;

  @ApiProperty({ example: 100000 })
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;
}
