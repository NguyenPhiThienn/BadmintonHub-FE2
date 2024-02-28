import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class AddVenueImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
