import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PricingsService } from './pricings.service';
import { CreatePricingDto, UpdatePricingDto } from './dto/pricing.dto';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Public } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Pricings Module (Quản lý Bảng giá)')
@Controller()
export class PricingsController {
  constructor(private readonly pricingsService: PricingsService) {}

  @ApiOperation({ summary: 'Lấy bảng giá của một cơ sở (để người chơi xem giá)' })
  @ApiResponse({ status: 200, description: 'Lấy bảng giá thành công' })
  @Public()
  @Get('venues/:venueId/pricing')
  async findByVenue(@Param('venueId') venueId: string): Promise<ApiResponseType> {
    return await this.pricingsService.findByVenue(venueId);
  }

  @ApiOperation({ summary: 'Cài đặt giá thuê (Chủ sân)' })
  @ApiResponse({ status: 201, description: 'Cài đặt thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Post('pricings')
  async create(@Req() req: any, @Body() dto: CreatePricingDto): Promise<ApiResponseType> {
    return await this.pricingsService.create(req.user, dto);
  }

  @ApiOperation({ summary: 'Cập nhật giá thuê (Chủ sân)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Put('pricings/:id')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdatePricingDto): Promise<ApiResponseType> {
    return await this.pricingsService.update(id, req.user, dto);
  }
}
