import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourtsService } from './courts.service';
import { CreateCourtDto, UpdateCourtDto } from './dto/court.dto';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Public } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Courts Module (Quản lý Sân lẻ)')
@Controller()
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @ApiOperation({ summary: 'Lấy danh sách các sân lẻ thuộc cơ sở' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Public()
  @Get('venues/:venueId/courts')
  async findByVenue(@Param('venueId') venueId: string): Promise<ApiResponseType> {
    return await this.courtsService.findByVenue(venueId);
  }

  @ApiOperation({ summary: 'Thêm sân mới vào cơ sở (Chủ sân)' })
  @ApiResponse({ status: 201, description: 'Thêm mới thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Post('courts')
  async create(@Req() req: any, @Body() dto: CreateCourtDto): Promise<ApiResponseType> {
    return await this.courtsService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái/thông tin sân lẻ (Chủ sân)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.COURT_OWNER, UserRole.ADMIN)
  @Put('courts/:id')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateCourtDto): Promise<ApiResponseType> {
    return await this.courtsService.update(id, req.user.id, dto);
  }
}
