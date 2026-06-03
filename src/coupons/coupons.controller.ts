import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Coupons Module (Quản lý Khuyến mãi)')
@Controller('owner/coupons')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.COURT_OWNER)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @ApiOperation({ summary: 'Lấy danh sách mã khuyến mãi của chủ sân' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get()
  async findAll(@Req() req: any, @Query() query: any): Promise<ApiResponseType> {
    return await this.couponsService.findAll(req.user.id, query);
  }

  @ApiOperation({ summary: 'Lấy chi tiết mã khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any): Promise<ApiResponseType> {
    return await this.couponsService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Tạo mã khuyến mãi mới' })
  @ApiResponse({ status: 201, description: 'Tạo mã thành công' })
  @Post()
  async create(@Req() req: any, @Body() dto: CreateCouponDto): Promise<ApiResponseType> {
    return await this.couponsService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Cập nhật mã khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Cập nhật mã thành công' })
  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateCouponDto): Promise<ApiResponseType> {
    return await this.couponsService.update(id, req.user.id, dto);
  }

  @ApiOperation({ summary: 'Xóa mã khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Xóa mã thành công' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any): Promise<ApiResponseType> {
    return await this.couponsService.remove(id, req.user.id);
  }
}
