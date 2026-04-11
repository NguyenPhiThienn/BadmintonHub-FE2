"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useDeleteDeviceType, useDeviceTypes } from "@/hooks/useTesting";
import { IDeviceType } from "@/interface/testing";
import {
    mdiDotsVertical,
    mdiFormatListBulletedType,
    mdiPlaylistRemove,
    mdiPlus,
    mdiSquareEditOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { useState } from "react";
import { DeviceTypeDialog } from "../DeviceTypeDialog";

interface DeviceTypeSidebarProps {
    selectedDeviceType: IDeviceType | null;
    onSelect: (deviceType: IDeviceType) => void;
}

export const DeviceTypeSidebar = ({ selectedDeviceType, onSelect }: DeviceTypeSidebarProps) => {
    const { data: deviceTypesResponse, isLoading } = useDeviceTypes();
    const deviceTypes = deviceTypesResponse?.data || [];

    const deleteMutation = useDeleteDeviceType();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDeviceType, setEditingDeviceType] = useState<IDeviceType | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingDeviceType, setDeletingDeviceType] = useState<IDeviceType | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    const filteredDeviceTypes = deviceTypes.filter((dt: IDeviceType) =>
        dt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setEditingDeviceType(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (e: React.MouseEvent | undefined, dt: IDeviceType) => {
        e?.stopPropagation();
        setEditingDeviceType(dt);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent, dt: IDeviceType) => {
        e.stopPropagation();
        setDeletingDeviceType(dt);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingDeviceType) {
            await deleteMutation.mutateAsync(deletingDeviceType._id);
            if (selectedDeviceType?._id === deletingDeviceType._id) {
            }
        }
    };

    return (
        <Card className="h-full border border-darkBorderV1 bg-darkCardV2 overflow-hidden flex flex-col !space-y-0 !gap-y-0">
            <div className="p-3 border-b border-darkBorderV1 bg-darkBackgroundV1 flex flex-col gap-3">
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2 text-accent font-semibold">
                        <Icon path={mdiFormatListBulletedType} size={0.8} />
                        <span>Loại thiết bị</span>
                    </div>
                    <Button onClick={handleAdd}>
                        <Icon path={mdiPlus} size={0.8} />
                        <span>Thêm loại</span>
                    </Button>
                </div>
                <Input
                    placeholder="Tìm kiếm loại thiết bị"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm("")}
                />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="p-4 text-center text-neutral-400 text-sm italic">Đang tải...</div>
                ) : filteredDeviceTypes.length === 0 ? (
                    <div className="text-center text-neutral-400 text-base py-4 italic flex items-center justify-center gap-2">
                        <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                        {searchTerm ? "Không tìm thấy loại thiết bị phù hợp." : "Không có loại thiết bị nào."}
                    </div>
                ) : (
                    <div className="divide-y divide-darkBorderV1/50">
                        {filteredDeviceTypes.map((dt: IDeviceType) => {
                            const isSelected = selectedDeviceType?._id?.toString() === dt._id?.toString();
                            return (
                                <div
                                    key={dt._id}
                                    className={`group flex items-center justify-between p-3 gap-2 cursor-pointer transition-colors ${isSelected
                                        ? "bg-accent/20"
                                        : "hover:bg-white/5"
                                        }`}
                                    onClick={() => onSelect(dt)}
                                >
                                    {dt.generatedFile && (
                                        <Badge variant="green">ĐCCH</Badge>
                                    )}
                                    <span className={`text-sm flex-1 text-start justify-start font-semibold ${isSelected ? "text-accent" : "text-neutral-300"}`}>
                                        {dt.name}
                                    </span>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant={isSelected ? "default" : "ghost"}
                                                className="rounded-full !h-9 !w-9"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Icon path={mdiDotsVertical} size={0.8} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem
                                                onClick={(e) => handleEdit(e as any, dt)}
                                            >
                                                <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                <span>Cập nhật</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={(e) => handleDeleteClick(e as any, dt)}
                                            >
                                                <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                <span>Xóa</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <DeviceTypeDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                deviceType={editingDeviceType}
            />

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                isDeleting={deleteMutation.isPending}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xóa loại thiết bị"
                description={`Bạn có chắc chắn muốn xóa loại thiết bị "${deletingDeviceType?.name}"? Hành động này sẽ xóa tất cả các cấu hình hạng mục liên quan và không thể hoàn tác.`}
                confirmText="Xác nhận xóa"
                successMessage="Xóa loại thiết bị thành công"
                errorMessage="Xóa loại thiết bị thất bại"
            />
        </Card>
    );
};
