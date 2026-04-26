"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteInspectionHistory, useEquipmentDetails, useUpdateInspection } from "@/hooks/useEquipment";
import { usePermissions } from "@/hooks/usePermissions";
import { IInspectionHistoryItem } from "@/interface/equipment";
import {
    mdiArchiveEyeOutline,
    mdiBarcode,
    mdiCalendarCheck,
    mdiCalendarClock,
    mdiCalendarRemoveOutline,
    mdiCertificate,
    mdiCheckCircleOutline,
    mdiClipboardCheckOutline,
    mdiClipboardTextClockOutline,
    mdiClose,
    mdiContentSave,
    mdiCounter,
    mdiFactory,
    mdiLabelOutline,
    mdiNoteTextOutline,
    mdiNumeric,
    mdiSquareEditOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useEffect, useState } from "react";

interface EquipmentDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    equipmentId: string | null;
    onEdit?: () => void;
    defaultTab?: string;
}

export const EquipmentDetailsDialog = ({
    isOpen,
    onClose,
    equipmentId,
    onEdit,
    defaultTab = "info",
}: EquipmentDetailsDialogProps) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [isEditingInspection, setIsEditingInspection] = useState(false);
    const { hasPermission } = usePermissions();
    const canUpdateEquipment = hasPermission("equipment-list:update");
    const [inspectionFormData, setInspectionFormData] = useState({
        inspectionDate: undefined as Date | undefined,
        inspectionSealNumber: "",
        nextInspectionDate: undefined as Date | undefined,
    });

    const { data: equipmentResponse, isLoading: isLoadingEquipment } = useEquipmentDetails(equipmentId || "");
    const equipment = equipmentResponse?.data;
    const { mutate: updateInspection, isPending: isUpdatingInspection } = useUpdateInspection();
    const { mutateAsync: deleteHistory, isPending: isDeletingHistory } = useDeleteInspectionHistory();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [indexToDelete, setIndexToDelete] = useState<number | null>(null);

    // Update active tab when defaultTab changes or dialog opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(defaultTab || "info");
            setIsEditingInspection(false);
        }
    }, [isOpen, defaultTab]);

    // Sync form data when equipment is loaded
    useEffect(() => {
        if (equipment) {
            setInspectionFormData({
                inspectionDate: equipment.inspectionDate ? new Date(equipment.inspectionDate) : undefined,
                inspectionSealNumber: equipment.inspectionSealNumber || "",
                nextInspectionDate: equipment.nextInspectionDate ? new Date(equipment.nextInspectionDate) : undefined,
            });
        }
    }, [equipment]);

    const handleSaveInspection = () => {
        if (!equipment?._id) return;

        const data = {
            inspectionDate: inspectionFormData.inspectionDate?.toISOString(),
            inspectionSealNumber: inspectionFormData.inspectionSealNumber,
            nextInspectionDate: inspectionFormData.nextInspectionDate?.toISOString(),
        };

        updateInspection(
            { id: equipment._id, data },
            {
                onSuccess: () => {
                    setIsEditingInspection(false);
                },
            }
        );
    };

    const handleCancelEditInspection = () => {
        if (equipment) {
            setInspectionFormData({
                inspectionDate: equipment.inspectionDate ? new Date(equipment.inspectionDate) : undefined,
                inspectionSealNumber: equipment.inspectionSealNumber || "",
                nextInspectionDate: equipment.nextInspectionDate ? new Date(equipment.nextInspectionDate) : undefined,
            });
        }
        setIsEditingInspection(false);
    };

    const handleDeleteHistory = (index: number) => {
        setIndexToDelete(index);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!equipment?._id || indexToDelete === null) return;
        return deleteHistory({ id: equipment._id, index: indexToDelete });
    };

    const formatDate = (date: string | undefined | Date) => {
        if (!date) return "Không có ngày";
        try {
            return format(new Date(date), "dd/MM/yyyy", { locale: vi });
        } catch {
            return "Không có ngày";
        }
    };

    // Calculate days until next inspection based on form data for real-time preview
    const getDaysUntilNextInspection = () => {
        const nextDateValue = isEditingInspection ? inspectionFormData.nextInspectionDate : (equipment?.nextInspectionDate ? new Date(equipment.nextInspectionDate) : null);
        if (!nextDateValue) return null;
        const today = new Date();
        const nextDate = new Date(nextDateValue);
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilNext = getDaysUntilNextInspection();
    const isExpiringSoon = daysUntilNext !== null && daysUntilNext <= 30 && daysUntilNext > 0;
    const isExpired = daysUntilNext !== null && daysUntilNext <= 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiArchiveEyeOutline} size={0.8} className="flex-shrink-0" />
                        <span>Chi tiết dụng cụ</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoadingEquipment ? (
                        <div className="space-y-4 md:space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : !equipment ? (
                        <div className="p-8 text-center text-neutral-300">
                            Không tìm thấy thông tin dụng cụ
                        </div>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList>
                                <TabsTrigger value="info">
                                    <Icon path={mdiArchiveEyeOutline} size={0.8} className="flex-shrink-0" />
                                    Thông tin cơ bản
                                </TabsTrigger>
                                <TabsTrigger value="history">
                                    <Icon
                                        path={mdiClipboardTextClockOutline}
                                        size={0.8}

                                    />
                                    Lý lịch thiết bị
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="info">
                                <div className="space-y-4 md:space-y-4">
                                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiBarcode} size={0.6} />
                                                            <span>Mã dụng cụ</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="green"> {equipment.equipmentCode}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiLabelOutline} size={0.6} />
                                                            <span>Tên dụng cụ</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">{equipment.equipmentName}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiNumeric} size={0.6} />
                                                            <span>Số chế tạo</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="neutral">{equipment.serialNumber || "Không có số chế tạo"}</Badge></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiFactory} size={0.6} />
                                                            <span>Hãng sản xuất</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">{equipment.manufacturer || "Không có Hãng sản xuất"}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiCounter} size={0.6} />
                                                            <span>Số lượng</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell><Badge variant="cyan">{equipment.quantity}</Badge></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiCheckCircleOutline} size={0.6} />
                                                            <span>Hiện có</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="cyan">{equipment.availableQuantity}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiClipboardCheckOutline} size={0.6} />
                                                            <span>Tình trạng</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
                                                        <Badge variant={equipment.status === "Sẵn sàng" ? "green" : "orange"}>
                                                            {equipment.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                                {equipment.notes && (
                                                    <TableRow>
                                                        <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                            <div className="flex items-center gap-2">
                                                                <Icon path={mdiNoteTextOutline} size={0.6} />
                                                                <span>Ghi chú</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-neutral-300">{equipment.notes}</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="history">
                                <div className="space-y-4 md:space-y-4">
                                    <div className="space-y-4 md:space-y-4">
                                        <div className="flex items-center gap-3 md:gap-4 flex-1">
                                            <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin kiểm định hiện tại</h3>
                                            <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                        </div>
                                        {!isEditingInspection ? (
                                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                                <Table>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiCalendarCheck} size={0.6} />
                                                                    <span>Ngày kiểm định</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell><Badge variant="neutral">{formatDate(equipment.inspectionDate) || "Không có ngày kiểm định"}</Badge></TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiCertificate} size={0.6} />
                                                                    <span>Số tem kiểm định</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-neutral-300">{equipment.inspectionSealNumber || "Không có số tem"}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiCalendarClock} size={0.6} />
                                                                    <span>Hạn kiểm định tiếp theo</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell><Badge variant="neutral">{formatDate(equipment.nextInspectionDate) || "Không có hạn kiểm định"}</Badge></TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </Card>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                                <div className="space-y-2">
                                                    <Label>Ngày kiểm định</Label>
                                                    <DatePicker
                                                        date={inspectionFormData.inspectionDate}
                                                        onDateChange={(date) => setInspectionFormData({ ...inspectionFormData, inspectionDate: date })}
                                                        withTime={true}
                                                        captionLayout="dropdown"
                                                        toYear={new Date().getFullYear() + 10}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Số tem kiểm định</Label>
                                                    <Input
                                                        value={inspectionFormData.inspectionSealNumber}
                                                        onChange={(e) => setInspectionFormData({ ...inspectionFormData, inspectionSealNumber: e.target.value })}
                                                        placeholder="VD: KD-9999"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Hạn kiểm định tiếp theo</Label>
                                                    <DatePicker
                                                        date={inspectionFormData.nextInspectionDate}
                                                        onDateChange={(date) => setInspectionFormData({ ...inspectionFormData, nextInspectionDate: date })}
                                                        withTime={true}
                                                        captionLayout="dropdown"
                                                        toYear={new Date().getFullYear() + 10}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {/* Inspection Status Alert */}
                                        {equipment.nextInspectionDate && (
                                            <div
                                                className={`mt-4 p-3 rounded-lg ${isExpired
                                                    ? "bg-red-500/10 border border-red-500/30"
                                                    : isExpiringSoon
                                                        ? "bg-amber-500/10 border border-amber-500/30"
                                                        : "bg-green-500/10 border border-green-500/30"
                                                    }`}
                                            >
                                                <p
                                                    className={`text-sm ${isExpired
                                                        ? "text-red-400"
                                                        : isExpiringSoon
                                                            ? "text-amber-500"
                                                            : "text-green-500"
                                                        }`}
                                                >
                                                    {isExpired
                                                        ? `⚠️ Thiết bị đã hết hạn kiểm định (${Math.abs(
                                                            daysUntilNext || 0
                                                        )} ngày trước)`
                                                        : isExpiringSoon
                                                            ? `⚠️ Thiết bị sắp đến hạn kiểm định (${daysUntilNext} ngày)`
                                                            : `✅ Thiết bị còn ${daysUntilNext} ngày đến hạn kiểm định`}
                                                </p>
                                            </div>
                                        )}
                                        <div className="w-full flex justify-end">
                                            {!isEditingInspection ? (
                                                canUpdateEquipment && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsEditingInspection(true)}
                                                    >
                                                        <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                        Cập nhật thông tin kiểm định
                                                    </Button>
                                                )
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleCancelEditInspection}
                                                    >
                                                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                                        Hủy
                                                    </Button>
                                                    <Button
                                                        onClick={handleSaveInspection}
                                                        disabled={isUpdatingInspection}
                                                    >
                                                        <Icon path={mdiContentSave} size={0.8} className="flex-shrink-0" />
                                                        Lưu thay đổi
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4 md:space-y-4">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <h3 className="text-accent font-semibold whitespace-nowrap">Lịch sử kiểm định</h3>
                                            <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                        </div>

                                        {!equipment?.inspectionHistory ||
                                            equipment.inspectionHistory.length === 0 ? (
                                            <div className="text-center text-neutral-300 text-sm py-8 italic flex items-center justify-center gap-1">
                                                <Icon path={mdiCalendarRemoveOutline} size={0.8} className="flex-shrink-0" />
                                                Không có lý lịch thiết bị. Nhấn nút &quot;Cập nhật thiết bị&quot; để thêm lý lịch thiết bị.
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>STT</TableHead>
                                                                <TableHead>Ngày kiểm định</TableHead>
                                                                <TableHead>Số tem</TableHead>
                                                                <TableHead>Hạn tiếp theo</TableHead>
                                                                <TableHead>Ngày cập nhật</TableHead>
                                                                {canUpdateEquipment && <TableHead className="text-right">Thao tác</TableHead>}
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {equipment.inspectionHistory.map(
                                                                (
                                                                    item: IInspectionHistoryItem,
                                                                    index: number
                                                                ) => (
                                                                    <TableRow key={index} className="hover:bg-accent/5 transition-colors">
                                                                        <TableCell className="text-center text-neutral-300">{index + 1}</TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="neutral">{formatDate(item.inspectionDate)}</Badge>
                                                                        </TableCell>
                                                                        <TableCell className="text-neutral-300">
                                                                            {item.inspectionSealNumber || "Không có số tem"}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="neutral">{formatDate(item.nextInspectionDate)}</Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="neutral">{formatDate(item.updatedAt)}</Badge>
                                                                        </TableCell>
                                                                        {
                                                                            canUpdateEquipment && <TableCell className="text-right">
                                                                                <Button
                                                                                    variant="red"
                                                                                    size="icon"
                                                                                    onClick={() => handleDeleteHistory(index)}
                                                                                    disabled={isDeletingHistory}
                                                                                >
                                                                                    <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                                                </Button>
                                                                            </TableCell>
                                                                        }
                                                                    </TableRow>
                                                                )
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                isDeleting={isDeletingHistory}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setIndexToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Xóa lịch sử kiểm định"
                description="Bạn có chắc chắn muốn xóa bản ghi lịch sử kiểm định này không? Thao tác này không thể hoàn tác."
                confirmText="Xóa bản ghi"
                successMessage="Xóa lịch sử kiểm định thành công"
                errorMessage="Xóa lịch sử kiểm định thất bại"
            />
        </Dialog>
    );
};
