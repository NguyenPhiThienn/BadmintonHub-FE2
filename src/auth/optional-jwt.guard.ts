import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT tuỳ chọn:
 * - Nếu có token hợp lệ -> req.user được populate (user đã đăng nhập)
 * - Nếu không có token hoặc token sai -> req.user = undefined (khách vãng lai)
 * - KHÔNG throw 401 như JwtGuard thông thường
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Không throw lỗi dù không có token
    return user || undefined;
  }
}
