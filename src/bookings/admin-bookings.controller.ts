import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Admin Bookings Module (Admin Quản lý Đặt sân)')
@Controller('admin/bookings')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @ApiOperation({ summary: 'Lấy danh sách tất cả đơn đặt sân' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo tên khách hoặc tên cơ sở' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('venueId') venueId?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponseType> {
    return await this.bookingsService.findAll({ page, limit, status, userId, venueId, search });
  }
}
