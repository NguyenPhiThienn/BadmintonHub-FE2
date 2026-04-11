"use client";

import { useCallback, useMemo } from "react";
import { useMe } from "@/hooks/useAuth";
export function usePermissions() {
    const { data: meResponse } = useMe();

    const role = meResponse?.data?.role;
    const permissions = meResponse?.data?.permissions || [];

    const isAdmin = role === "admin";
    const hasPermission = useCallback(
        (permissionId: string): boolean => {
            if (isAdmin) return true;
            return permissions.includes(permissionId);
        },
        [isAdmin, permissions]
    );

    const hasAnyPermission = useCallback(
        (...permissionIds: string[]): boolean => {
            if (isAdmin) return true;
            return permissionIds.some((id) => permissions.includes(id));
        },
        [isAdmin, permissions]
    );

    const hasAllPermissions = useCallback(
        (...permissionIds: string[]): boolean => {
            if (isAdmin) return true;
            return permissionIds.every((id) => permissions.includes(id));
        },
        [isAdmin, permissions]
    );

    return useMemo(
        () => ({
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
            isAdmin,
            role,
            permissions,
        }),
        [hasPermission, hasAnyPermission, hasAllPermissions, isAdmin, role, permissions]
    );
}
