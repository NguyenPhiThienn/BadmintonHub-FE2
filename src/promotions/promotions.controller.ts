import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Public } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Promotions Module (Quản lý Khuyến mãi)')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) { }

  @ApiOperation({ summary: 'Lấy danh sách khuyến mãi đang áp dụng' })
  @ApiResponse({ status: 200, description: 'Lấy thành công' })
  @ApiQuery({ name: 'venueId', required: false })
  @Public()
  @Get('valid')
  async getValidPromotions(@Query('venueId') venueId: string): Promise<ApiResponseType> {
    return await this.promotionsService.getValidPromotions(venueId);
  }

  @ApiOperation({ summary: 'Tạo mã giảm giá/khuyến mãi (Chủ sân, Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Post()
  async create(@Req() req: any, @Body() dto: CreatePromotionDto): Promise<ApiResponseType> {
    return await this.promotionsService.create(req.user, dto);
  }

  @ApiOperation({ summary: 'Cập nhật mã giảm giá/khuyến mãi (Chủ sân, Admin)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdatePromotionDto): Promise<ApiResponseType> {
    return await this.promotionsService.update(id, req.user, dto);
  }

  @ApiOperation({ summary: 'Quản lý toàn bộ danh sách khuyến mãi (Admin/Chủ sân)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo mã khuyến mãi' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('venueId') venueId?: string,
    @Query('search') search?: string
  ): Promise<ApiResponseType> {
    return await this.promotionsService.findAll(Number(page), Number(limit), venueId, search);
  }
}
