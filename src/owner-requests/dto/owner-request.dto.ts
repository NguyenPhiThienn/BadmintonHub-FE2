import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOwnerRequestDto {
  @ApiProperty({ example: '031202001234', description: 'Số Căn cước công dân' })
  @IsNotEmpty({ message: 'Số Căn cước công dân không được để trống' })
  @IsString()
  identityCard: string;

  @ApiProperty({ example: '123 Lê Văn Thọ, Phường 14, Gò Vấp', description: 'Địa chỉ sân cầu lông' })
  @IsNotEmpty({ message: 'Địa chỉ sân không được để trống' })
  @IsString()
  courtAddress: string;

  @ApiProperty({ example: ['url1', 'url2'], description: 'Ảnh thực tế của sân' })
  @IsNotEmpty({ message: 'Ảnh thực tế không được để trống' })
  @IsArray()
  @IsString({ each: true })
  courtImages: string[];

  @ApiProperty({ example: 'url_business_license', description: 'Ảnh Giấy phép hoạt động kinh doanh' })
  @IsNotEmpty({ message: 'Ảnh giấy phép kinh doanh không được để trống' })
  @IsString()
  businessLicense: string;
}

export class ReviewOwnerRequestDto {
  @ApiProperty({ example: 'APPROVED', description: 'Trạng thái xét duyệt: APPROVED hoặc REJECTED' })
  @IsNotEmpty({ message: 'Trạng thái xét duyệt không được để trống' })
  @IsString()
  status: 'APPROVED' | 'REJECTED';

  @ApiProperty({ example: 'Hồ sơ mờ, không rõ thông tin CCCD', description: 'Lý do từ chối (bắt buộc nếu REJECTED)', required: false })
  @IsOptional()
  @IsString()
  rejectReason?: string;
}
