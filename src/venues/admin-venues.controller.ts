import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Admin Venues Module (Admin Quản lý Cơ sở sân)')
@Controller('admin/venues')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminVenuesController {
  constructor(private readonly venuesService: VenuesService) { }

  @ApiOperation({ summary: 'Lấy danh sách tất cả cơ sở sân' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo tên hoặc địa chỉ' })
  @Get()
  async getAllVenues(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
  ): Promise<ApiResponseType> {
    return await this.venuesService.findAll({ status, page, limit, search, sortBy, allStatuses: !status });
  }

  @ApiOperation({ summary: 'Lấy danh sách sân đang chờ duyệt' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get('pending')
  async getPendingVenues(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseType> {
    return await this.venuesService.findAll({ status: 'PENDING', page, limit });
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái cơ sở sân (Duyệt/Từ chối)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ): Promise<ApiResponseType> {
    return await this.venuesService.updateStatus(id, body.status, body.reason);
  }

  @ApiOperation({ summary: 'Duyệt cơ sở sân (Admin)' })
  @ApiResponse({ status: 200, description: 'Duyệt thành công' })
  @Patch(':id/approve')
  async approveVenue(@Param('id') id: string): Promise<ApiResponseType> {
    return await this.venuesService.updateStatus(id, 'ACTIVE');
  }

  @ApiOperation({ summary: 'Từ chối cơ sở sân (Admin)' })
  @ApiResponse({ status: 200, description: 'Từ chối thành công' })
  @Patch(':id/reject')
  async rejectVenue(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ): Promise<ApiResponseType> {
    return await this.venuesService.updateStatus(id, 'REJECTED', body.reason);
  }

  @ApiOperation({ summary: 'Xóa cơ sở sân' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @Delete(':id')
  async deleteVenue(@Param('id') id: string): Promise<ApiResponseType> {
    return await this.venuesService.remove(id);
  }
}
