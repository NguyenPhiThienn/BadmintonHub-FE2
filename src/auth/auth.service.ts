import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/schemas/user.schema';
import { RegisterDto, LoginDto, ChangePasswordDto, RefreshTokenDto, ForgotPasswordDto } from './dto/auth.dto';
import { ApiResponseType, createApiResponse } from '../utils/response.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto): Promise<ApiResponseType> {
    const existingUser = await this.userModel.findOne({
      $or: [{ email: dto.email }, { phone: dto.phone }]
    }).exec();

    if (existingUser) {
      throw new HttpException('Email hoặc số điện thoại đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.userModel.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash: hashedPassword,
      // Luôn lưu là PLAYER, việc nâng cấp lên OWNER sẽ do Admin phê duyệt qua trang Owner Requests
      role: UserRole.PLAYER,
    });

    const userObj = newUser.toObject();
    delete userObj.passwordHash;

    return createApiResponse(userObj, 'Đăng ký tài khoản thành công', HttpStatus.CREATED);
  }

  async login(dto: LoginDto): Promise<ApiResponseType> {
    const user = await this.userModel.findOne({
      $or: [{ email: dto.identifier }, { phone: dto.identifier }],
    }).exec();

    if (!user) {
      throw new HttpException('Tài khoản không tồn tại', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordMatch) {
      throw new HttpException('Mật khẩu không chính xác', HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const lastLogin = new Date();
    await this.userModel.findByIdAndUpdate(user._id, { lastLogin });

    return createApiResponse(
      {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
          status: user.status,
          blockedReason: user.blockedReason,
          lastLogin: lastLogin,
        },
      },
      'Đăng nhập thành công',
      HttpStatus.OK,
    );
  }

  async refreshToken(dto: RefreshTokenDto): Promise<ApiResponseType> {
    try {
      const payload = this.jwtService.verify(dto.refreshToken);
      const user = await this.userModel.findById(payload.sub).exec();

      if (!user) throw new Error();

      const newPayload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload, { expiresIn: '1d' });
      const refreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      return createApiResponse({ accessToken, refreshToken }, 'Làm mới token thành công', HttpStatus.OK);
    } catch (error) {
      throw new HttpException('Refresh token không hợp lệ hoặc đã hết hạn', HttpStatus.UNAUTHORIZED);
    }
  }

  async logout(userId: string): Promise<ApiResponseType> {
    // In a stateless architecture, logout is usually handled by client clearing tokens.
    // If you cache/blacklist tokens, do it here.
    return createApiResponse(null, 'Đăng xuất thành công', HttpStatus.OK);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<ApiResponseType> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new HttpException('Email không tồn tại trong hệ thống', HttpStatus.NOT_FOUND);
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userModel.findByIdAndUpdate(user._id, { passwordHash: newHash });

    return createApiResponse(null, 'Đặt lại mật khẩu thành công', HttpStatus.OK);
  }


  async changePassword(userId: string, dto: ChangePasswordDto): Promise<ApiResponseType> {
    if (dto.confirmPassword && dto.newPassword !== dto.confirmPassword) {
      throw new HttpException('Mật khẩu xác nhận không khớp', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);

    const isOldPasswordMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isOldPasswordMatch) {
      throw new HttpException('Mật khẩu hiện tại không đúng', HttpStatus.BAD_REQUEST);
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, { passwordHash: newHash });

    return createApiResponse(null, 'Đổi mật khẩu thành công', HttpStatus.OK);
  }

  async validateUser(payload: any) {
    const user = await this.userModel.findById(payload.sub).exec();
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }

  async getMe(userId: string): Promise<ApiResponseType> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
    }

    // Update lastLogin to track realtime online status
    const now = new Date();
    await this.userModel.findByIdAndUpdate(userId, { lastLogin: now });

    return createApiResponse({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      status: user.status,
      lastLogin: now,
    }, 'Lấy thông tin thành công', HttpStatus.OK);
  }

  async updateMe(userId: string, dto: any): Promise<ApiResponseType> {
    const user = await this.userModel.findByIdAndUpdate(userId, { $set: dto }, { new: true }).select('-passwordHash').exec();
    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
    }
    return createApiResponse({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      lastLogin: user.lastLogin,
    }, 'Cập nhật thông tin thành công', HttpStatus.OK);
  }
}
