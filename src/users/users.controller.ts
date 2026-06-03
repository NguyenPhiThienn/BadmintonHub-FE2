import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from './schemas/user.schema';

@ApiTags('Users Module (Quản lý hồ sơ người dùng)')
@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Lấy thông tin cá nhân' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @Get('profile')
  async getProfile(@Req() req: any): Promise<ApiResponseType> {
    return await this.usersService.getProfile(req.user.id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @ApiResponse({ status: 200, description: 'Cập nhật thông tin thành công' })
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto): Promise<ApiResponseType> {
    return await this.usersService.updateProfile(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Lưu FCM Token để nhận thông báo đẩy' })
  @ApiResponse({ status: 200, description: 'Lưu FCM Token thành công' })
  @Post('fcm-token')
  async saveFcmToken(@Req() req: any, @Body('token') token: string): Promise<ApiResponseType> {
    return await this.usersService.saveFcmToken(req.user.id, token);
  }

  @ApiOperation({ summary: 'Xóa FCM Token khi đăng xuất' })
  @ApiResponse({ status: 200, description: 'Xóa FCM Token thành công' })
  @Delete('fcm-token')
  async removeFcmToken(@Req() req: any, @Body('token') token: string): Promise<ApiResponseType> {
    return await this.usersService.removeFcmToken(req.user.id, token);
  }

  @ApiOperation({ summary: 'Thêm người dùng mới (Admin)' })
  @ApiResponse({ status: 201, description: 'Thêm thành công' })
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<ApiResponseType> {
    return await this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Quản lý danh sách người dùng (Admin)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách người dùng thành công' })
  @Roles(UserRole.ADMIN)
  @Get()
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string
  ): Promise<ApiResponseType> {
    return await this.usersService.getAllUsers(Number(page), Number(limit), search, role, status);
  }

  // =============================================
  // FAVORITE VENUES
  // =============================================

  @ApiOperation({ summary: 'Lấy danh sách sân yêu thích của user hiện tại' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get('favorites')
  async getFavoriteVenues(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseType> {
    return await this.usersService.getFavoriteVenues(req.user.id, Number(page), Number(limit));
  }

  @ApiOperation({ summary: 'Thêm hoặc xóa sân yêu thích (Toggle)' })
  @ApiResponse({ status: 200, description: 'Toggle thành công' })
  @Post('favorites/toggle')
  async toggleFavoriteVenue(
    @Req() req: any,
    @Body() body: { venueId: string },
  ): Promise<ApiResponseType> {
    return await this.usersService.toggleFavoriteVenue(req.user.id, body.venueId);
  }

  @ApiOperation({ summary: 'Xem chi tiết người dùng (Admin)' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponseType> {
    return await this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật người dùng (Admin)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<ApiResponseType> {
    return await this.usersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Khóa/Mở khóa tài khoản người dùng (Admin)' })
  @ApiResponse({ status: 200, description: 'Thao tác thành công' })
  @Roles(UserRole.ADMIN)
  @Patch(':id/block')
  async blockUser(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { action: 'block' | 'unblock'; blockType?: string; reason?: string; days?: number }
  ): Promise<ApiResponseType> {
    return await this.usersService.blockUser(req.user.id, id, body);
  }

  @ApiOperation({ summary: 'Xóa người dùng (Admin)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponseType> {
    return await this.usersService.remove(id);
  }


}

