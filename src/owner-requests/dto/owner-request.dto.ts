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

  @ApiProperty({ example: 'Vietcombank', description: 'Tên ngân hàng' })
  @IsNotEmpty({ message: 'Tên ngân hàng không được để trống' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: '123456789', description: 'Số tài khoản ngân hàng' })
  @IsNotEmpty({ message: 'Số tài khoản ngân hàng không được để trống' })
  @IsString()
  bankAccountNumber: string;

  @ApiProperty({ example: 'NGUYEN VAN A', description: 'Tên chủ tài khoản' })
  @IsNotEmpty({ message: 'Tên chủ tài khoản không được để trống' })
  @IsString()
  bankAccountName: string;

  @ApiProperty({ example: '031202001234', description: 'Mã số thuế' })
  @IsNotEmpty({ message: 'Mã số thuế không được để trống' })
  @IsString()
  taxCode: string;

  @ApiProperty({ example: true, description: 'Đồng ý với các điều khoản' })
  @IsNotEmpty({ message: 'Phải xác nhận đồng ý với các điều khoản' })
  isAgreedToTerms: boolean;
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
