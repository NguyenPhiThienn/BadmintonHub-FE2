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
import { useCreateEmployee } from "@/hooks/useEmployees";
import { useEmployeeFormStore } from "@/stores/useEmployeeFormStore";
import {
    mdiAccountPlus,
    mdiClose,
    mdiEye,
    mdiEyeOff,
    mdiLoading,
} from "@mdi/js";
import Icon from "@mdi/react";
import { useState } from "react";
import { toast } from "react-toastify";

interface CreateEmployeeDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateEmployeeDialog = ({
    isOpen,
    onClose,
}: CreateEmployeeDialogProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const { formData, setFormData, resetFormData } = useEmployeeFormStore();
    const { mutate: createEmployee, isPending } = useCreateEmployee();

    const handleChange = (field: string, value: any) => {
        setFormData({ [field]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields: string[] = [];
        if (!formData.fullName?.trim()) missingFields.push("Họ và tên");
        if (!formData.employeeCode?.trim()) missingFields.push("Mã nhân viên");
        if (!formData.dateOfBirth) missingFields.push("Ngày tháng năm sinh");
        if (!formData.hometown?.trim()) missingFields.push("Quê quán");
        if (!formData.phoneNumber?.trim()) missingFields.push("Số điện thoại");
        if (!formData.department?.trim()) missingFields.push("Phòng ban");
        if (!formData.position?.trim()) missingFields.push("Chức vụ");
        if (!formData.password?.trim()) missingFields.push("Mật khẩu");

        if (missingFields.length > 0) {
            toast.warning(
                <div className="flex flex-col gap-1">
                    <p className="font-bold border-b border-orange-400/20 pb-1 mb-1 text-sm">Vui lòng điền đủ thông tin:</p>
                    <ul className="list-disc ml-4 text-xs space-y-1">
                        {missingFields.map((field, index) => (
                            <li key={index}>{field}</li>
                        ))}
                    </ul>
                </div>
            );
            return;
        }

        createEmployee(formData, {
            onSuccess: () => {
                resetFormData();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiAccountPlus} size={0.8} className="flex-shrink-0" />
                        <span>Thêm nhân viên mới</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="create-employee-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Họ và tên <span className="text-red-400 italic text-sm">(*)</span></Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => handleChange("fullName", e.target.value)}
                                placeholder="Ví dụ: Nguyễn Văn A"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employeeCode">Mã nhân viên <span className="text-red-400 italic text-sm">(*)</span></Label>
                            <Input
                                id="employeeCode"
                                value={formData.employeeCode}
                                onChange={(e) => handleChange("employeeCode", e.target.value)}
                                placeholder="Ví dụ: NV001"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Ngày sinh <span className="text-red-400 italic text-sm">(*)</span></Label>
                            <DatePicker
                                date={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined}
                                onDateChange={(date) => handleChange("dateOfBirth", date?.toISOString())}
                                captionLayout="dropdown"
                                toYear={new Date().getFullYear() + 10}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Số điện thoại <span className="text-red-400 italic text-sm">(*)</span></Label>
                            <Input
                                id="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                placeholder="Ví dụ: 0901234567"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hometown">Quê quán (Nguyên quán) <span className="text-red-400 italic text-sm">(*)</span></Label>
                            <Input
                                id="hometown"
                                value={formData.hometown}
                                onChange={(e) => handleChange("hometown", e.target.value)}
                                placeholder="Ví dụ: Đà Nẵng"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Phòng ban <span className="text-red-400 italic text-sm">(*)</span></Label>
                            <Input
                                id="department"
                                value={formData.department}
                                onChange={(e) => handleChange("department", e.target.value)}
                                placeholder="Ví dụ: Kỹ thuật"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="position">Chức vụ <span className="text-red-400 italic text-sm">(*)</span></Label>
                            <Input
                                id="position"
                                value={formData.position}
                                onChange={(e) => handleChange("position", e.target.value)}
                                placeholder="Ví dụ: Nhân viên"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu <span className="text-red-400 italic text-sm">(*)</span></Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    placeholder="********"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-accent transition-colors"
                                >
                                    <Icon path={showPassword ? mdiEyeOff : mdiEye} size={0.8} className="flex-shrink-0" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="identityCard">Số CCCD</Label>
                            <Input
                                id="identityCard"
                                value={formData.identityCard}
                                onChange={(e) => handleChange("identityCard", e.target.value)}
                                placeholder="Ví dụ: 00120300xxxx"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="qualification">Trình độ (Bậc)</Label>
                            <Input
                                id="qualification"
                                value={formData.qualification}
                                onChange={(e) => handleChange("qualification", e.target.value)}
                                placeholder="Ví dụ: Kỹ sư, 3/7..."
                            />
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    <Button
                        type="submit"
                        form="create-employee-form"
                        disabled={isPending}
                    >
                        <Icon
                            path={isPending ? mdiLoading : mdiAccountPlus}
                            size={0.8}
                        />
                        {isPending ? "Đang lưu..." : "Thêm mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};
