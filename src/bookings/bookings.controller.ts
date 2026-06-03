import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/auth.decorators';
import { JwtGuard, OptionalJwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { ApiResponseType } from '../utils/response.util';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto, ApplyCouponDto } from './dto/booking.dto';

@ApiTags('Booking Module (Quản lý Đặt sân)')
@Controller('bookings')
@ApiBearerAuth('access-token')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @ApiOperation({ summary: 'Tạo đơn đặt sân mới' })
  @ApiResponse({ status: 201, description: 'Đặt sân thành công' })
  @UseGuards(OptionalJwtGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateBookingDto): Promise<ApiResponseType> {
    return await this.bookingsService.create(req.user?.id, dto);
  }

  @ApiOperation({ summary: 'Lấy danh sách mã khuyến mãi khả dụng cho cơ sở sân' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @UseGuards(OptionalJwtGuard)
  @Get('available-coupons/:venueId')
  async getAvailableCoupons(@Param('venueId') venueId: string): Promise<ApiResponseType> {
    return await this.bookingsService.getAvailableCoupons(venueId);
  }

  @ApiOperation({ summary: 'Kiểm tra và áp dụng mã khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Áp dụng mã thành công' })
  @UseGuards(OptionalJwtGuard)
  @Post('apply-coupon')
  async applyCoupon(@Body() dto: ApplyCouponDto): Promise<ApiResponseType> {
    return await this.bookingsService.applyCoupon(dto);
  }

  @ApiOperation({ summary: 'Xem lịch sử đặt sân của người chơi' })
  @ApiResponse({ status: 200, description: 'Lấy lịch sử thành công' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.PLAYER, UserRole.ADMIN, UserRole.COURT_OWNER)
  @Get('my-bookings')
  async getMyBookings(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('isWeekly') isWeekly?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ): Promise<ApiResponseType> {
    return await this.bookingsService.getMyBookings(req.user.id, Number(page), Number(limit), status, search, isWeekly, paymentMethod);
  }

  @ApiOperation({ summary: 'Lấy thống kê cá nhân của người chơi (Tổng giờ chơi...)' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê thành công' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.PLAYER, UserRole.ADMIN, UserRole.COURT_OWNER)
  @Get('my-statistics')
  async getMyStatistics(@Req() req: any): Promise<ApiResponseType> {
    return await this.bookingsService.getMyStatistics(req.user.id);
  }

  @ApiOperation({ summary: 'Xem chi tiết đơn đặt sân' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  @UseGuards(OptionalJwtGuard)
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string): Promise<ApiResponseType> {
    return await this.bookingsService.findOne(req.user.id, id);
  }

  @ApiOperation({ summary: 'Quản lý danh sách đơn đặt sân của cơ sở (Chủ sân)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Get('venue/:venueId')
  async getVenueBookings(
    @Req() req: any,
    @Param('venueId') venueId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<ApiResponseType> {
    return await this.bookingsService.getVenueBookings(req.user.id, venueId, Number(page), Number(limit));
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái Booking (Xác nhận, Hủy đơn...)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN, UserRole.PLAYER)
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateBookingStatusDto): Promise<ApiResponseType> {
    return await this.bookingsService.updateStatus(req.user.id, id, dto, req.user.role);
  }

  @ApiOperation({ summary: 'Yêu cầu hoàn tiền khi hủy đơn đã thanh toán' })
  @ApiResponse({ status: 200, description: 'Yêu cầu hoàn tiền thành công' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.PLAYER, UserRole.ADMIN, UserRole.COURT_OWNER)
  @Post(':id/refund-request')
  async requestRefund(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: any
  ): Promise<ApiResponseType> {
    return await this.bookingsService.requestRefund(req.user.id, id, dto, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy tất cả đơn đặt sân của chủ sân (Tất cả cơ sở)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Get('owner/all')
  async getOwnerBookings(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('venueId') venueId?: string,
    @Query('search') search?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ): Promise<ApiResponseType> {
    return await this.bookingsService.getOwnerBookings(req.user.id, Number(page), Number(limit), { status, venueId, search, paymentMethod });
  }

  @ApiOperation({ summary: 'Tạo đơn đặt sân thủ công hoặc Khóa sân (Chủ sân)' })
  @ApiResponse({ status: 201, description: 'Thao tác thành công' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Post('manual')
  async createManual(@Req() req: any, @Body() dto: any): Promise<ApiResponseType> {
    return await this.bookingsService.createManualBooking(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Lấy dữ liệu lịch biểu (Calendar/Timeline View)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Get('calendar/:venueId')
  async getCalendar(@Req() req: any, @Param('venueId') venueId: string, @Query('date') date: string): Promise<ApiResponseType> {
    return await this.bookingsService.getCalendarData(req.user.id, venueId, date);
  }

  @ApiOperation({ summary: 'Lấy danh sách khách hàng thân thiết (Chủ sân)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Get('owner/customers')
  async getCustomers(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<ApiResponseType> {
    return await this.bookingsService.getOwnerCustomers(req.user.id, Number(page), Number(limit));
  }
}
