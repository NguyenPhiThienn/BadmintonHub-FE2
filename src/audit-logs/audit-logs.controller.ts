import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';

import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Audit Logs')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy lịch sử audit log' })
  @ApiResponse({ status: 200, description: 'Lấy thành công' })
  async getAll(
    @Query('limit') limit: number = 100,
    @Query('skip') skip: number = 0,
  ) {
    const logs = await this.auditLogsService.findAll(Number(limit), Number(skip));
    return {
      statusCode: 200,
      message: 'Lấy audit log thành công',
      data: logs,
    };
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy audit log theo user' })
  @ApiResponse({ status: 200, description: 'Lấy thành công' })
  async getByUser(@Param('userId') userId: string, @Query('limit') limit: number = 50) {
    const logs = await this.auditLogsService.findByUser(userId, Number(limit));
    return {
      statusCode: 200,
      message: 'Lấy audit log thành công',
      data: logs,
    };
  }

  @Get('admin/:adminId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy audit log theo admin' })
  @ApiResponse({ status: 200, description: 'Lấy thành công' })
  async getByAdmin(@Param('adminId') adminId: string, @Query('limit') limit: number = 100) {
    const logs = await this.auditLogsService.findByAdmin(adminId, Number(limit));
    return {
      statusCode: 200,
      message: 'Lấy audit log thành công',
      data: logs,
    };
  }
}
