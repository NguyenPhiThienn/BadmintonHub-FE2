import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { GetAvailabilityDto, BlockAvailabilityDto, LockSlotDto } from './dto/availability.dto';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Public } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Availability Module (Quản lý Lịch trống & Khung giờ)')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @ApiOperation({ summary: 'Xem các khung giờ còn trống của một sân vào một ngày cụ thể' })
  @ApiResponse({ status: 200, description: 'Lấy lịch trống thành công' })
  @Public()
  @Get()
  async getAvailability(@Query() dto: GetAvailabilityDto): Promise<ApiResponseType> {
    return await this.availabilityService.getAvailability(dto);
  }

  @ApiOperation({ summary: 'Đóng khung giờ - bảo trì hoặc có khách offline (Chủ sân)' })
  @ApiResponse({ status: 201, description: 'Đã chặn khung giờ thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Post('block')
  async block(@Req() req: any, @Body() dto: BlockAvailabilityDto): Promise<ApiResponseType> {
    return await this.availabilityService.blockAvailability(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Khóa tạm thời một khung giờ' })
  @ApiResponse({ status: 201, description: 'Khóa giờ thành công' })
  @Public()
  @Post('lock')
  async lockSlot(@Body() dto: LockSlotDto): Promise<ApiResponseType> {
    return await this.availabilityService.lockSlot(dto);
  }

  @ApiOperation({ summary: 'Mở khóa tạm thời một khung giờ' })
  @ApiResponse({ status: 200, description: 'Mở khóa giờ thành công' })
  @Public()
  @Post('unlock')
  async unlockSlot(@Body() dto: LockSlotDto): Promise<ApiResponseType> {
    return await this.availabilityService.unlockSlot(dto);
  }
}
