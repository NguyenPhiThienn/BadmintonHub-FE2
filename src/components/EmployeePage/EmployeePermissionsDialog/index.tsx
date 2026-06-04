import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUpdateEmployee } from "@/hooks/useEmployees";
import { IEmployee } from "@/interface/employee";
import { mdiClose, mdiContentSave, mdiLoading, mdiShieldAccount } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";

interface EmployeePermissionsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    employee: IEmployee | null;
}

interface PermissionNode {
    id: string;
    name: string;
    subMenu?: PermissionNode[];
    actions?: PermissionNode[];
}

export const EmployeePermissionsDialog = ({
    isOpen,
    onClose,
    employee,
}: EmployeePermissionsDialogProps) => {
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee();

    useEffect(() => {
        if (isOpen && employee?.permissions) {
            setSelectedPermissions(employee.permissions);
        } else if (isOpen) {
            setSelectedPermissions([]);
        }
    }, [isOpen, employee]);

    const modules: PermissionNode[] = [
        { id: "dashboard", name: "Báo cáo và thống kê" },
        {
            id: "employee-management",
            name: "Quản lý nhân sự",
            actions: [
                { id: "employee-management:add", name: "Add" },
                { id: "employee-management:repass", name: "RePass" },
                { id: "employee-management:update", name: "Update" },
                { id: "employee-management:delete", name: "Delete" },
                { id: "employee-management:author", name: "Author" },
            ]
        },
        {
            id: "equipment-management",
            name: "Quản lý dụng cụ",
            subMenu: [
                {
                    id: "equipment-list",
                    name: "Quản lý dụng cụ",
                    actions: [
                        { id: "equipment-list:add", name: "Add" },
                        { id: "equipment-list:update", name: "Update" },
                        { id: "equipment-list:delete", name: "Delete" },
                    ]
                },
                {
                    id: "equipment-inventory",
                    name: "Kiểm kho",
                    actions: [
                        { id: "equipment-inventory:add", name: "Add" },
                        { id: "equipment-inventory:delete", name: "Delete" },
                    ]
                },
            ]
        },
        {
            id: "work-management",
            name: "Điều hành & chấm công",
            subMenu: [
                {
                    id: "task-schedule",
                    name: "Lịch làm việc",
                    actions: [
                        { id: "task-schedule:add", name: "Add" },
                        { id: "task-schedule:update", name: "Update" },
                    ]
                },
                {
                    id: "attendance-management",
                    name: "Chấm công",
                    actions: [
                        { id: "attendance-management:view-table", name: "ViewTable" },
                    ]
                },
            ]
        },
        {
            id: "construction-management",
            name: "Quản lý thi công",
            subMenu: [
                {
                    id: "construction-logs",
                    name: "Nhật ký thi công",
                    actions: [
                        { id: "construction-logs:add", name: "Add" },
                        { id: "construction-logs:update", name: "Update" },
                        { id: "construction-logs:delete", name: "Delete" },
                    ]
                },
                {
                    id: "construction-plans",
                    name: "Phương án thi công",
                    actions: [
                        { id: "construction-plans:add", name: "Add" },
                        { id: "construction-plans:update", name: "Update" },
                        { id: "construction-plans:delete", name: "Delete" },
                    ]
                },
            ]
        },
        {
            id: "utilities",
            name: "Tiện ích",
            subMenu: [
                {
                    id: "partner-management",
                    name: "Quản lý công ty",
                    actions: [
                        { id: "partner-management:add", name: "Add" },
                        { id: "partner-management:update", name: "Update" },
                        { id: "partner-management:delete", name: "Delete" },
                    ]
                },
                {
                    id: "document-management",
                    name: "Quản lý văn bản",
                    actions: [
                        { id: "document-management:upload", name: "Upload" },
                        { id: "document-management:add", name: "Add" },
                        { id: "document-management:update", name: "Update" },
                        { id: "document-management:delete", name: "Delete" },
                    ]
                },
                {
                    id: "contract-management",
                    name: "Quản lý hợp đồng",
                    actions: [
                        { id: "contract-management:add", name: "Add" },
                        { id: "contract-management:update", name: "Update" },
                        { id: "contract-management:delete", name: "Delete" },
                    ]
                },
            ]
        },
    ];

    const togglePermission = (id: string, subMenu?: PermissionNode[], actions?: PermissionNode[]) => {
        setSelectedPermissions(prev => {
            const isSelected = prev.includes(id);
            let next = isSelected ? prev.filter(p => p !== id) : [...prev, id];

            // If toggled, recursively toggle all nested children and actions
            const collectChildIds = (items: PermissionNode[]): string[] => {
                let ids: string[] = [];
                items.forEach(item => {
                    ids.push(item.id);
                    if (item.subMenu) ids = [...ids, ...collectChildIds(item.subMenu)];
                    if (item.actions) ids = [...ids, ...collectChildIds(item.actions)];
                });
                return ids;
            };

            let allChildIds: string[] = [];
            if (subMenu) allChildIds = [...allChildIds, ...collectChildIds(subMenu)];
            if (actions) allChildIds = [...allChildIds, ...collectChildIds(actions)];

            if (allChildIds.length > 0) {
                if (isSelected) {
                    next = next.filter(p => !allChildIds.includes(p));
                } else {
                    next = [...new Set([...next, ...allChildIds])];
                }
            }
            return next;
        });
    };

    const handleSavePermissions = () => {
        if (!employee?._id) return;

        updateEmployee(
            {
                id: employee._id,
                data: { permissions: selectedPermissions }
            },
            {
                onSuccess: () => {
                    onClose();
                }
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiShieldAccount} size={0.8} className="flex-shrink-0" />
                        <span>Phân quyền người dùng: {employee?.fullName}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {modules.map((mod) => (
                            <div key={mod.id} className="flex flex-col h-full rounded-xl border border-darkBorderV1 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center gap-3 p-3 border-b border-darkBorderV1">
                                    <Checkbox
                                        id={mod.id}
                                        checked={selectedPermissions.includes(mod.id)}
                                        onCheckedChange={() => togglePermission(mod.id, mod.subMenu, mod.actions)}
                                        className="h-6 w-6 border-primary/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <Label htmlFor={mod.id} className="text-primary font-semibold text-sm md:text-base cursor-pointer select-none">
                                        {mod.name}
                                    </Label>
                                </div>

                                <div className="p-3 flex-1 flex flex-col gap-4">
                                    {mod.actions && (
                                        <div className="flex flex-wrap gap-x-3 gap-y-2">
                                            {mod.actions.map((action) => (
                                                <div key={action.id} className="flex items-center gap-1 p-1 pr-2 rounded-md border border-primary/60 bg-primary/50 hover:bg-primary/40 transition-colors group">
                                                    <Checkbox
                                                        id={action.id}
                                                        checked={selectedPermissions.includes(action.id)}
                                                        onCheckedChange={() => togglePermission(action.id)}
                                                        className="h-5 w-5 border-primary/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                    <Label htmlFor={action.id} className="text-xs text-neutral-300 font-semibold cursor-pointer select-none group-hover:text-primary transition-colors">
                                                        {action.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {mod.subMenu && (
                                        <div className="space-y-4">
                                            {mod.subMenu.map((sub) => (
                                                <div key={sub.id} className="space-y-2 rounded-lg p-2 bg-darkBackgroundV1/20 border border-darkBorderV1/30">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={sub.id}
                                                            checked={selectedPermissions.includes(sub.id)}
                                                            onCheckedChange={() => togglePermission(sub.id, sub.subMenu, sub.actions)}
                                                            className="h-6 w-6 border-primary/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                        />
                                                        <Label htmlFor={sub.id} className="text-base md:text-sm font-semibold text-neutral-300 cursor-pointer select-none">
                                                            {sub.name}
                                                        </Label>
                                                    </div>
                                                    {sub.actions && (
                                                        <div className="ml-6 flex flex-wrap gap-x-3 gap-y-1.5">
                                                            {sub.actions.map((action) => (
                                                                <div key={action.id} className="flex items-center gap-1 p-1 rounded-md bg-primary/50 border border-primary/60 hover:bg-primary/40 transition-colors group pr-2">
                                                                    <Checkbox
                                                                        id={action.id}
                                                                        checked={selectedPermissions.includes(action.id)}
                                                                        onCheckedChange={() => togglePermission(action.id)}
                                                                        className="h-5 w-5 border-primary/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                    />
                                                                    <Label htmlFor={action.id} className="text-xs text-neutral-300 font-semibold cursor-pointer select-none group-hover:text-primary transition-colors">
                                                                        {action.name}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isUpdating}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Hủy
                    </Button>
                    <Button onClick={handleSavePermissions} disabled={isUpdating}>
                        <Icon
                            path={isUpdating ? mdiLoading : mdiContentSave}
                            size={0.8}
                        />
                        {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
