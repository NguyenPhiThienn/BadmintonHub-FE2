import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards, Delete, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnerRequestsService } from './owner-requests.service';
import { CreateOwnerRequestDto, ReviewOwnerRequestDto } from './dto/owner-request.dto';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Owner Requests Module (Quản lý đơn đăng ký chủ sân)')
@Controller('owner-requests')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
export class OwnerRequestsController {
  constructor(private readonly ownerRequestsService: OwnerRequestsService) {}

  @ApiOperation({ summary: 'Gửi đơn đăng ký chủ sân (Player)' })
  @ApiResponse({ status: 201, description: 'Gửi đơn thành công' })
  @Post()
  async create(@Req() req: any, @Body() dto: CreateOwnerRequestDto): Promise<ApiResponseType> {
    return await this.ownerRequestsService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Lấy trạng thái đơn đăng ký hiện tại của tôi (Player)' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @Get('my-request')
  async getMyRequest(@Req() req: any): Promise<ApiResponseType> {
    return await this.ownerRequestsService.getMyRequest(req.user.id);
  }

  @ApiOperation({ summary: 'Chỉnh sửa và Nộp lại đơn đăng ký chủ sân (Player)' })
  @ApiResponse({ status: 200, description: 'Cập nhật đơn thành công' })
  @Put('my-request')
  async updateMyRequest(@Req() req: any, @Body() dto: CreateOwnerRequestDto): Promise<ApiResponseType> {
    return await this.ownerRequestsService.updateMyRequest(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Xóa / Hủy đơn đăng ký chủ sân (Player)' })
  @ApiResponse({ status: 200, description: 'Xóa đơn thành công' })
  @Delete('my-request')
  async deleteMyRequest(@Req() req: any): Promise<ApiResponseType> {
    return await this.ownerRequestsService.deleteMyRequest(req.user.id);
  }

  @ApiOperation({ summary: 'Xem danh sách đơn đăng ký (Admin)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(@Query() query: any): Promise<ApiResponseType> {
    return await this.ownerRequestsService.findAll(query);
  }

  @ApiOperation({ summary: 'Xem chi tiết đơn đăng ký (Admin)' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponseType> {
    return await this.ownerRequestsService.findOne(id);
  }

  @ApiOperation({ summary: 'Duyệt hoặc từ chối đơn đăng ký chủ sân (Admin)' })
  @ApiResponse({ status: 200, description: 'Xử lý đơn thành công' })
  @Roles(UserRole.ADMIN)
  @Patch(':id/review')
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewOwnerRequestDto,
  ): Promise<ApiResponseType> {
    return await this.ownerRequestsService.review(id, dto);
  }
}
