import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: '60d5ecb8b3945a278c8574e9', description: 'ID of the venue' })
  @IsNotEmpty()
  @IsString()
  venueId: string;

  @ApiProperty({ example: '60d5ecb8b3945a278c8574e9', description: 'ID of the completed booking' })
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({ example: 5, description: 'Rating stars (1-5)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Sân đẹp, phục vụ tốt!', description: 'Comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ReplyReviewDto {
  @ApiProperty({ example: 'Cảm ơn bạn đã đánh giá!', description: 'Reply text' })
  @IsNotEmpty()
  @IsString()
  reply: string;
}
