import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/auth.decorators';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { ApiResponseType } from '../utils/response.util';
import { DashboardService } from './dashboard.service';

@ApiTags('Admin Dashboard Module (Tổng quan hệ thống cho Admin)')
@Controller('admin/dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @ApiOperation({ summary: 'Lấy thông tin tổng quan hệ thống (Revenue, Bookings, Users)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Get('summary')
  async getSummary(@Query() query: any): Promise<ApiResponseType> {
    return await this.dashboardService.getAdminSummary(query);
  }

  @ApiOperation({ summary: 'Lấy dữ liệu biểu đồ phân tích' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Get('charts')
  async getCharts(
    @Query('type') type: string = 'revenue',
    @Query('period') period: string = 'month'
  ): Promise<ApiResponseType> {
    return await this.dashboardService.getAdminCharts(type, period);
  }

  @ApiOperation({ summary: 'Lấy báo cáo doanh thu chi tiết (Bộ lọc)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Roles(UserRole.ADMIN, UserRole.COURT_OWNER, UserRole.OWNER)
  @Get('revenue-report')
  async getRevenueReport(@Query() query: any): Promise<ApiResponseType> {
    return await this.dashboardService.getAdminRevenueReport(query);
  }
}
