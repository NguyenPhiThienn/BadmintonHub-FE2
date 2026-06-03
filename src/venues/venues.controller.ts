import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { CreateVenueDto, UpdateVenueDto } from './dto/venue.dto';
import { AddVenueImageDto } from './dto/venue-image.dto';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Public } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Venues Module (Quản lý Cơ sở sân cầu lông)')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) { }

  @ApiOperation({ summary: 'Tìm kiếm, lọc danh sách cơ sở sân' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiQuery({ name: 'keyword', required: false })
  @Public()
  @Get()
  async findAll(@Query() query: any): Promise<ApiResponseType> {
    return await this.venuesService.findAll(query);
  }

  @ApiOperation({ summary: 'Lấy danh sách cơ sở của tôi (Chủ sân)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Get('my-venues')
  async findMyVenues(@Req() req: any, @Query() query: any): Promise<ApiResponseType> {
    return await this.venuesService.findAll({ ...query, ownerId: req.user.id, allStatuses: true });
  }

  @ApiOperation({ summary: 'Xem chi tiết một cơ sở sân' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponseType> {
    return await this.venuesService.findOne(id);
  }

  @ApiOperation({ summary: 'Đăng ký thông tin cơ sở mới (Chủ sân)' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateVenueDto): Promise<ApiResponseType> {
    return await this.venuesService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin cơ sở (Chủ sân)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateVenueDto): Promise<ApiResponseType> {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return await this.venuesService.update(id, req.user.id, dto, isAdmin);
  }

  @ApiOperation({ summary: 'Thêm hình ảnh cho cơ sở (Chủ sân)' })
  @ApiResponse({ status: 201, description: 'Thêm hình ảnh thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Post(':id/images')
  async addImage(@Param('id') id: string, @Req() req: any, @Body() dto: AddVenueImageDto): Promise<ApiResponseType> {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return await this.venuesService.addImage(id, req.user.id, dto, isAdmin);
  }

  @ApiOperation({ summary: 'Xóa cơ sở sân (Chủ sân / Admin)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any): Promise<ApiResponseType> {
    const isAdmin = req.user.role === UserRole.ADMIN;
    if (!isAdmin) {
      const venue = await this.venuesService.findOne(id);
      if (!venue || venue.data.ownerId._id.toString() !== req.user.id) {
        throw new HttpException('Bạn không có quyền xóa cơ sở này hoặc cơ sở không tồn tại', HttpStatus.FORBIDDEN);
      }
    }
    return await this.venuesService.remove(id);
  }

  @ApiOperation({ summary: 'Reset tất cả ratings về 0 (Admin)' })
  @ApiResponse({ status: 200, description: 'Reset thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/reset-ratings')
  async resetAllRatings(): Promise<ApiResponseType> {
    return await this.venuesService.resetAllRatings();
  }

  @ApiOperation({ summary: 'Yêu cầu đóng cửa cơ sở (Chủ sân)' })
  @ApiResponse({ status: 200, description: 'Yêu cầu đóng cửa đã được gửi' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER)
  @Put(':id/request-closure')
  async requestClosure(@Param('id') id: string, @Req() req: any): Promise<ApiResponseType> {
    return await this.venuesService.requestClosure(id, req.user.id);
  }

  @ApiOperation({ summary: 'Hủy yêu cầu đóng cửa cơ sở (Chủ sân)' })
  @ApiResponse({ status: 200, description: 'Yêu cầu đóng cửa đã được hủy' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER)
  @Put(':id/cancel-closure')
  async cancelClosure(@Param('id') id: string, @Req() req: any): Promise<ApiResponseType> {
    return await this.venuesService.cancelClosure(id, req.user.id);
  }

  @ApiOperation({ summary: 'Duyệt yêu cầu đóng cửa cơ sở (Admin)' })
  @ApiResponse({ status: 200, description: 'Cơ sở đã được đóng cửa' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id/approve-closure')
  async approveClosure(@Param('id') id: string): Promise<ApiResponseType> {
    return await this.venuesService.approveClosure(id);
  }

  @ApiOperation({ summary: 'Xin mở lại cơ sở đã đóng (Chủ sân)' })
  @ApiResponse({ status: 200, description: 'Yêu cầu mở lại đã được gửi' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER)
  @Put(':id/request-reopen')
  async requestReopen(@Param('id') id: string, @Req() req: any): Promise<ApiResponseType> {
    return await this.venuesService.requestReopen(id, req.user.id);
  }
}
