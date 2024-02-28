import { Body, Controller, Get, Post, Put, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto, RefreshTokenDto, ForgotPasswordDto } from './dto/auth.dto';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { JwtGuard } from './jwt-auth.guard';
import { MailService } from '../mail/mail.service';
import { RolesGuard } from './roles.guard';
import { Roles } from './decorators/auth.decorators';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Authentication & Authorization')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) { }

  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Email hoặc số điện thoại đã tồn tại' })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<ApiResponseType> {
    return await this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về tokens' })
  @ApiResponse({ status: 401, description: 'Tên đăng nhập hoặc mật khẩu sai' })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<ApiResponseType> {
    return await this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Làm mới token' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<ApiResponseType> {
    return await this.authService.refreshToken(dto);
  }

  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<ApiResponseType> {
    return await this.authService.forgotPassword(dto);
  }

  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: any): Promise<ApiResponseType> {
    return await this.authService.logout(req.user.id);
  }

  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Get('me')
  async getMe(@Req() req: any): Promise<ApiResponseType> {
    return await this.authService.getMe(req.user.id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin người dùng hiện tại' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Put('me')
  async updateMe(@Req() req: any, @Body() dto: any): Promise<ApiResponseType> {
    return await this.authService.updateMe(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Put('change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto): Promise<ApiResponseType> {
    return await this.authService.changePassword(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Gửi email thông báo trạng thái owner request (Admin)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('send-owner-status')
  async sendOwnerStatusEmail(@Body() body: {
    email: string;
    fullName: string;
    status: 'APPROVED' | 'REJECTED';
    rejectReason?: string;
  }): Promise<ApiResponseType<null>> {
    const success = await this.mailService.sendOwnerRequestStatusEmail(body);
    if (success) {
      return createApiResponse(null, 'Gửi email thông báo thành công', HttpStatus.OK);
    } else {
      return createApiResponse(null, 'Gửi email thông báo thất bại', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
