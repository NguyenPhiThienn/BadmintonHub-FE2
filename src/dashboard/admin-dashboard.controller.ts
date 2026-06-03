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

  @ApiOperation({ summary: 'Chỉ số Tổng quan hệ thống (System Overview)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Get('overview')
  async getOverview(@Query() query: any): Promise<ApiResponseType> {
    return await this.dashboardService.getSystemOverview(query);
  }

  @ApiOperation({ summary: 'Việc cần làm của Admin (Pending Actions)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Get('pending-actions')
  async getPendingActions(): Promise<ApiResponseType> {
    return await this.dashboardService.getAdminPendingActions();
  }

  @ApiOperation({ summary: 'Dữ liệu Biểu đồ (Revenue & Bookings Chart)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Get('chart')
  async getChart(@Query() query: any): Promise<ApiResponseType> {
    return await this.dashboardService.getAdminChartData(query);
  }

  @ApiOperation({ summary: 'Bảng Xếp Hạng Cơ Sở (Leaderboards)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Get('leaderboards')
  async getLeaderboards(@Query() query: any): Promise<ApiResponseType> {
    return await this.dashboardService.getAdminLeaderboards(query);
  }

  @ApiOperation({ summary: 'Lấy báo cáo doanh thu chi tiết (Bộ lọc)' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @Roles(UserRole.ADMIN, UserRole.COURT_OWNER, UserRole.OWNER)
  @Get('revenue-report')
  async getRevenueReport(@Query() query: any): Promise<ApiResponseType> {
    return await this.dashboardService.getAdminRevenueReport(query);
  }
}
