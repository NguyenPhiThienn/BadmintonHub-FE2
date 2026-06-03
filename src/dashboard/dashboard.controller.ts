import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Revenue & Dashboard Module (Báo cáo Thống kê cho Chủ sân)')
@Controller('dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Thống kê doanh thu theo ngày/tháng/năm' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Get('revenue')
  async getRevenue(@Req() req: any, @Query() query: any): Promise<ApiResponseType> {
    return await this.dashboardService.getRevenue(req.user.id, query.venueId, query);
  }

  @ApiOperation({ summary: 'Thống kê số lượng đơn đặt sân, tỉ lệ lấp đầy sân' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Get('bookings')
  async getBookings(@Req() req: any, @Query() query: any): Promise<ApiResponseType> {
    return await this.dashboardService.getBookingStats(req.user.id, query.venueId, query);
  }

  @ApiOperation({ summary: 'Dự đoán doanh thu tuần tới dựa trên dữ liệu quá khứ' })
  @ApiResponse({ status: 200, description: 'Dự đoán thành công' })
  @Get('predict-revenue')
  async predictRevenue(@Req() req: any, @Query('venueId') venueId?: string): Promise<ApiResponseType> {
    return await this.dashboardService.predictRevenue(req.user.id, venueId);
  }

  @ApiOperation({ summary: 'Lấy báo cáo doanh thu chi tiết (Lọc theo cơ sở, phương thức, ngày)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Get('revenue-report')
  async getRevenueReport(@Req() req: any, @Query() query: any): Promise<ApiResponseType> {
    // Add ownerId to query for filtering
    const params = { ...query, ownerId: req.user.id };
    return await this.dashboardService.getAdminRevenueReport(params);
  }

  @ApiOperation({ summary: 'Biểu đồ doanh thu (Lọc theo cơ sở, phương thức, ngày)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu biểu đồ thành công' })
  @Get('revenue-chart')
  async getRevenueChart(@Req() req: any, @Query() query: any): Promise<ApiResponseType> {
    return await this.dashboardService.getOwnerRevenueChart(req.user.id, query);
  }

  @ApiOperation({ summary: 'Hiệu suất khai thác (7 ngày gần nhất)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu hiệu suất thành công' })
  @Get('occupancy-rate')
  async getOccupancyRate(@Req() req: any, @Query('venueId') venueId?: string): Promise<ApiResponseType> {
    return await this.dashboardService.getBookingStats(req.user.id, venueId);
  }

  @ApiOperation({ summary: 'KPI Tổng quan kèm xu hướng (Trend)' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @Get('overview')
  async getOverview(@Req() req: any, @Query('venueId') venueId?: string): Promise<ApiResponseType> {
    return await this.dashboardService.getOverviewStats(req.user.id, venueId);
  }

  @ApiOperation({ summary: 'Hoạt động gần đây (Recent Bookings)' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @Get('recent-bookings')
  async getRecentBookings(@Req() req: any, @Query('venueId') venueId?: string): Promise<ApiResponseType> {
    return await this.dashboardService.getRecentBookings(req.user.id, venueId);
  }

  @ApiOperation({ summary: 'Bảng xếp hạng Khách hàng (VIPs & Risks)' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @Get('top-customers')
  async getTopCustomers(@Req() req: any, @Query('venueId') venueId?: string): Promise<ApiResponseType> {
    return await this.dashboardService.getTopCustomers(req.user.id, venueId);
  }

  @ApiOperation({ summary: 'Thống kê Khung giờ vàng (Peak Hours Analysis)' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @Get('peak-hours')
  async getPeakHours(@Req() req: any, @Query('venueId') venueId?: string): Promise<ApiResponseType> {
    return await this.dashboardService.getPeakHours(req.user.id, venueId);
  }
}
