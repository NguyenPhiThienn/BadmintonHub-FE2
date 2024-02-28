import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentUrlDto } from './dto/payment.dto';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/auth.decorators';

@ApiTags('Payment Module (Quản lý Thanh toán Online)')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @ApiOperation({ summary: 'Tạo link thanh toán online (VNPay, Momo...)' })
  @ApiResponse({ status: 201, description: 'Tạo link thành công' })
  @Public()
  @Post('create-url')
  async createUrl(@Body() dto: CreatePaymentUrlDto): Promise<ApiResponseType> {
    return await this.paymentsService.createPaymentUrl(dto);
  }

  @ApiOperation({ summary: 'Xử lý webhook/IPN trả về từ cổng thanh toán' })
  @Public()
  @Get('callback')
  async callback(@Query() query: any, @Res() res: any): Promise<any> {
    await this.paymentsService.handleCallback(query);
    const bookingId = query.vnp_TxnRef || query.orderId;
    const frontendUrl = process.env.FRONTEND_URL || 'https://badmintonhubs.vercel.app';
    return res.redirect(`${frontendUrl}/booking/success?bookingId=${bookingId}`);
  }

  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán của một đơn đặt sân' })
  @ApiResponse({ status: 200, description: 'Lấy trạng thái thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Get(':bookingId')
  async getStatus(@Param('bookingId') bookingId: string): Promise<ApiResponseType> {
    return await this.paymentsService.getPaymentStatus(bookingId);
  }
}
