import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateUser } from "@/hooks/useUsers";
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

interface CreateUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateUserDialog = ({
    isOpen,
    onClose,
}: CreateUserDialogProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "PLAYER"
    });

    const { mutate: createUser, isPending } = useCreateUser();

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields: string[] = [];
        if (!formData.fullName.trim()) missingFields.push("Họ và tên");
        if (!formData.email.trim()) missingFields.push("Email");
        if (!formData.phone.trim()) missingFields.push("Số điện thoại");
        if (!formData.password.trim()) missingFields.push("Mật khẩu");

        if (missingFields.length > 0) {
            toast.warning(
                <div className="flex flex-col gap-1">
                    <p className="font-semibold border-b border-orange-400/20 pb-1 mb-1 text-sm">Vui lòng điền đủ thông tin:</p>
                    <ul className="list-disc ml-4 text-xs space-y-1">
                        {missingFields.map((field, index) => (
                            <li key={index}>{field}</li>
                        ))}
                    </ul>
                </div>
            );
            return;
        }

        createUser(formData, {
            onSuccess: () => {
                setFormData({
                    fullName: "",
                    email: "",
                    phone: "",
                    password: "",
                    role: "PLAYER"
                });
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
                        <span>Thêm người dùng mới</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="create-user-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Vai trò hệ thống</Label>
                            <Select value={formData.role} onValueChange={(val) => handleChange("role", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PLAYER">Người chơi</SelectItem>
                                    <SelectItem value="COURT_OWNER">Chủ sân</SelectItem>
                                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                        <div className="grid grid-cols-3 gap-4 col-span-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email <span className="text-red-400 italic text-sm">(*)</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="Ví dụ: example@mail.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại <span className="text-red-400 italic text-sm">(*)</span></Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    placeholder="Ví dụ: 0901234567"
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
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="h-9">
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    <Button
                        type="submit"
                        form="create-user-form"
                        disabled={isPending}
                    >
                        <Icon
                            path={isPending ? mdiLoading : mdiAccountPlus}
                            size={0.8}
                            className={`flex-shrink-0 ${isPending ? "animate-spin" : ""}`}
                        />
                        {isPending ? "Đang xử lý..." : "Thêm mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};
