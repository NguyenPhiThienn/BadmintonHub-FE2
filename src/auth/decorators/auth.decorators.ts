import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
export const RequirePermissions = (...permissions: string[]) =>
    SetMetadata('permissions', permissions);
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
export const GetUserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.id;
    },
);
export const GetEmployeeId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.employeeId;
    },
);
