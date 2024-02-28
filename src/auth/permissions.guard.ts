import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Không có quyền truy cập');
        }

        if (user.role === 'admin') {
            return true;
        }
        if (!user.permissions) {
            throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
        }

        const hasPermission = requiredPermissions.every(
            permission => user.permissions?.includes(permission)
        );

        if (!hasPermission) {
            throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
        }

        return true;
    }
}
