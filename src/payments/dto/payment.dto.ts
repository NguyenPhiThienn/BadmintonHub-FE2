import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../schemas/payment.schema';

export class CreatePaymentUrlDto {
  @ApiProperty({ example: '60d5ecb8b3945a278c8574e8', description: 'ID of the booking' })
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.VNPAY })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
