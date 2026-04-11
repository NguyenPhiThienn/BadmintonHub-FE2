import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuantityInput } from "@/components/ui/quantity-input";
import {
    useCreateEquipment,
    useEquipmentDetails,
    useUpdateEquipment,
} from "@/hooks/useEquipment";
import { IEquipment } from "@/interface/equipment";
import { useEquipmentFormStore } from "@/stores/useEquipmentFormStore";
import {
    mdiClose,
    mdiLoading,
    mdiPackageVariantClosedPlus,
    mdiPlus,
    mdiSquareEditOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect } from "react";

interface EquipmentEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    item: IEquipment | null;
}

export const EquipmentEditDialog = ({
    isOpen,
    onClose,
    item,
}: EquipmentEditDialogProps) => {
    const isEdit = !!item;
    const { mutate: createEquipment, isPending: isCreating } = useCreateEquipment();
    const { mutate: updateEquipment, isPending: isUpdating } = useUpdateEquipment();
    const { formData, setFormData, resetFormData } = useEquipmentFormStore();

    // Fetch latest details if editing
    const { data: equipmentDetail } = useEquipmentDetails(
        item?._id || ""
    );

    // Initialize form data when data is loaded from API or when opening for new equipment
    useEffect(() => {
        if (isOpen) {
            if (isEdit && equipmentDetail?.data) {
                const detail = equipmentDetail.data;
                setFormData({
                    equipmentCode: detail.equipmentCode,
                    equipmentName: detail.equipmentName,
                    serialNumber: detail.serialNumber,
                    manufacturer: detail.manufacturer,
                    quantity: detail.quantity,
                    availableQuantity: detail.availableQuantity,
                    status: detail.status,
                    inspectionSealNumber: detail.inspectionSealNumber || "",
                    inspectionDate: detail.inspectionDate || "",
                    nextInspectionDate: detail.nextInspectionDate || "",
                    notes: detail.notes,
                });
            }
        }
    }, [isOpen, isEdit, equipmentDetail, setFormData]);

    const handleChange = (field: string, value: any) => {
        if (field === "quantity" && !isEdit) {
            setFormData({ [field]: value, availableQuantity: value });
        } else {
            setFormData({ [field]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && item) {
            const { equipmentCode, ...updateData } = formData;
            updateEquipment(
                { id: item._id, data: updateData },
                {
                    onSuccess: () => {
                        resetFormData();
                        onClose();
                    },
                }
            );
        } else {
            createEquipment(formData, {
                onSuccess: () => {
                    resetFormData();
                    onClose();
                },
            });
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={isEdit ? mdiSquareEditOutline : mdiPackageVariantClosedPlus} size={0.8} className="flex-shrink-0" />
                        <span>{isEdit ? "Cập nhật dụng cụ" : "Thêm dụng cụ mới"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="equipment-edit-form" onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="equipmentCode">Mã dụng cụ</Label>
                                    <Input
                                        id="equipmentCode"
                                        value={formData.equipmentCode}
                                        onChange={(e) => handleChange("equipmentCode", e.target.value)}
                                        placeholder="DC001"
                                        required
                                        disabled={isEdit}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="equipmentName">Tên dụng cụ</Label>
                                    <Input
                                        id="equipmentName"
                                        value={formData.equipmentName}
                                        onChange={(e) => handleChange("equipmentName", e.target.value)}
                                        placeholder="Máy hàn"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serialNumber">Số chế tạo</Label>
                                    <Input
                                        id="serialNumber"
                                        value={formData.serialNumber}
                                        onChange={(e) => handleChange("serialNumber", e.target.value)}
                                        placeholder="SN-12345"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manufacturer">Hãng sản xuất <i>(Manufacturer)</i></Label>
                                    <Input
                                        id="manufacturer"
                                        value={formData.manufacturer}
                                        onChange={(e) => handleChange("manufacturer", e.target.value)}
                                        placeholder="Bosch"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Số lượng</Label>
                                    <QuantityInput
                                        value={formData.quantity}
                                        onChange={(val) => handleChange("quantity", val)}
                                        min={1}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="availableQuantity">Hiện có</Label>
                                    <QuantityInput
                                        value={formData.availableQuantity}
                                        onChange={(val) => handleChange("availableQuantity", val)}
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Tình trạng</Label>
                                    <Input
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => handleChange("status", e.target.value)}
                                        placeholder="Sẵn sàng, Đang bảo trì..."
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="notes">Ghi chú</Label>
                                    <Input
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleChange("notes", e.target.value)}
                                        placeholder="Ghi chú thêm cho dụng cụ..."
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Section 2: Equipment History / Inspection */}
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Lý lịch thiết bị</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="inspectionSealNumber">Số tem kiểm định</Label>
                                    <Input
                                        id="inspectionSealNumber"
                                        value={formData.inspectionSealNumber}
                                        onChange={(e) => handleChange("inspectionSealNumber", e.target.value)}
                                        placeholder="TEM-12345"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ngày kiểm định</Label>
                                    <DatePicker
                                        date={formData.inspectionDate ? new Date(formData.inspectionDate) : undefined}
                                        onDateChange={(date) => handleChange("inspectionDate", date?.toISOString() || "")}
                                        captionLayout="dropdown"
                                        toYear={new Date().getFullYear() + 10}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ngày kiểm định tiếp theo</Label>
                                    <DatePicker
                                        date={formData.nextInspectionDate ? new Date(formData.nextInspectionDate) : undefined}
                                        onDateChange={(date) => handleChange("nextInspectionDate", date?.toISOString() || "")}
                                        captionLayout="dropdown"
                                        toYear={new Date().getFullYear() + 10}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating || isUpdating}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    <Button type="submit" form="equipment-edit-form" disabled={isCreating || isUpdating}>
                        <Icon
                            path={
                                isCreating || isUpdating
                                    ? mdiLoading
                                    : isEdit
                                        ? mdiSquareEditOutline
                                        : mdiPlus
                            }
                            size={0.8}
                        />
                        {isCreating || isUpdating
                            ? "Đang lưu..."
                            : isEdit
                                ? "Lưu thay đổi"
                                : "Thêm mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
