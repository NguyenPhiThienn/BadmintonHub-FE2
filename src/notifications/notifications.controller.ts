import { Controller, Get, Put, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notifications Module (Quản lý Thông báo)')
@Controller('notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Lấy danh sách thông báo của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get()
  async getMyNotifications(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<ApiResponseType> {
    return await this.notificationsService.getMyNotifications(req.user.id, Number(page), Number(limit));
  }

  @ApiOperation({ summary: 'Đánh dấu 1 thông báo đã đọc' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any): Promise<ApiResponseType> {
    return await this.notificationsService.markAsRead(id, req.user.id);
  }

  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @Put('read-all')
  async markAllAsRead(@Req() req: any): Promise<ApiResponseType> {
    return await this.notificationsService.markAllAsRead(req.user.id);
  }
}
