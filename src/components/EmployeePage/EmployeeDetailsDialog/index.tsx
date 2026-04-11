import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { useMe } from "@/hooks/useAuth";
import {
    useEmployeeDetails,
    useUpdateEmployee,
} from "@/hooks/useEmployees";
import { usePermissions } from "@/hooks/usePermissions";
import { useUploadImage } from "@/hooks/useUpload";
import { IEmployee } from "@/interface/employee";
import {
    mdiAccount,
    mdiAccountEdit,
    mdiAccountTie,
    mdiAutoFix,
    mdiBarcode,
    mdiCalendar,
    mdiCardAccountDetailsOutline,
    mdiCheckCircle,
    mdiCheckCircleOutline,
    mdiCircleOutline,
    mdiClipboardAccount,
    mdiClose,
    mdiCloudUploadOutline,
    mdiContentSave,
    mdiDownload,
    mdiEye,
    mdiEyeOff,
    mdiLoading,
    mdiMapMarkerOutline,
    mdiOfficeBuilding,
    mdiPhone,
    mdiSchool,
    mdiShieldAccount,
    mdiSignatureFreehand,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { Allura } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { EmployeePermissionsDialog } from "../EmployeePermissionsDialog";

const allura = Allura({
    subsets: ["latin"],
    weight: ["400"],
});

interface EmployeeDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    employee: IEmployee | null;
    initialIsEditing?: boolean;
}

interface PermissionNode {
    id: string;
    name: string;
    subMenu?: PermissionNode[];
    actions?: PermissionNode[];
}

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

export const EmployeeDetailsDialog = ({
    isOpen,
    onClose,
    employee,
    initialIsEditing = false,
}: EmployeeDetailsDialogProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [signatureText, setSignatureText] = useState("");
    const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee();
    const { mutateAsync: uploadImage } = useUploadImage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { hasPermission } = usePermissions();
    const canUpdate = hasPermission("employee-management:update");
    const canAuthor = hasPermission("employee-management:author");
    const { data: meRes } = useMe();
    const isAdmin = meRes?.data?.role === "admin";

    // Fetch latest employee details
    const employeeId = employee?._id || "";
    const { data: employeeDetailsResponse, isLoading: isDetailsLoading } =
        useEmployeeDetails(employeeId);

    const employeeData = useMemo(() => {
        const detail: any =
            (employeeDetailsResponse as any)?.data?.employee ||
            (employeeDetailsResponse as any)?.data ||
            employee ||
            null;
        return detail as IEmployee | null;
    }, [employeeDetailsResponse, employee]);

    // Reset/Set editing mode when dialog opens
    useEffect(() => {
        if (isOpen) {
            setIsEditing(initialIsEditing);
        }
    }, [isOpen, initialIsEditing]);

    const [formData, setFormData] = useState({
        employeeCode: "",
        fullName: "",
        dateOfBirth: "",
        hometown: "",
        phoneNumber: "",
        department: "",
        position: "",
        identityCard: "",
        qualification: "",
        isActive: true,
        password: "",
        digitalSignature: "",
        avatar: "",
    });

    // Reset form when employee data changes
    useEffect(() => {
        if (employeeData) {
            setFormData({
                employeeCode: employeeData.employeeCode || "",
                fullName: employeeData.fullName || "",
                dateOfBirth: employeeData.dateOfBirth || "",
                hometown: employeeData.hometown || "",
                phoneNumber: employeeData.phoneNumber || "",
                department: employeeData.department || "",
                position: employeeData.position || "",
                identityCard: employeeData.identityCard || "",
                qualification: employeeData.qualification || "",
                isActive: employeeData.isActive ?? true,
                password: "", // Reset password field when switching employees
                digitalSignature: employeeData.digitalSignature || "",
                avatar: employeeData.avatar || "",
            });
            setSignatureText(employeeData.fullName || "");
        }
    }, [employeeData, isOpen]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (employeeData?._id) {
            const { employeeCode, password, ...rest } = formData;
            const payload: any = { ...rest };
            if (password && password.trim() !== "") {
                payload.password = password.trim();
            }

            updateEmployee(
                { id: employeeData._id, data: payload },
                {
                    onSuccess: () => {
                        setIsEditing(false);
                    },
                }
            );
        }
    };

    const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const response = await uploadImage(file);
                if (response?.data?.url) {
                    handleChange("avatar", response.data.url);
                    toast.success("Đã tải lên ảnh đại diện!");
                }
            } catch (error) {
                toast.error("Không thể tải lên ảnh đại diện");
            }
        }
    };

    const handleUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const response = await uploadImage(file);
                if (response?.data?.url) {
                    handleChange("digitalSignature", response.data.url);
                }
            } catch (error) {
                console.error("Upload signature error:", error);
            }
        }
    };

    const generateSignatureImage = async () => {
        if (!signatureText) {
            toast.error("Vui lòng nhập tên để tạo chữ ký");
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `140px ${allura.style.fontFamily}, cursive`;
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(signatureText, canvas.width / 2, canvas.height / 2);

            canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], "signature.png", { type: "image/png" });
                    try {
                        const response = await uploadImage(file);
                        if (response?.data?.url) {
                            handleChange("digitalSignature", response.data.url);
                            toast.success("Đã tạo và tải lên chữ ký!");
                        }
                    } catch (error) {
                        toast.error("Không thể tải lên chữ ký vừa tạo");
                    }
                }
            }, "image/png");
        }
    };

    const downloadSignature = async () => {
        const signatureUrl = isEditing ? formData.digitalSignature : employeeData?.digitalSignature;
        if (!signatureUrl) {
            toast.error("Không tìm thấy chữ ký để tải");
            return;
        }

        const id = toast.loading("Đang chuẩn bị tệp tải xuống...");
        try {
            const response = await fetch(signatureUrl);
            if (!response.ok) throw new Error("Network response was not ok");

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `signature-${employeeData?.fullName || "nhan-vien"}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            toast.update(id, {
                render: "Tải xuống thành công!",
                type: "success",
                isLoading: false,
                autoClose: 2000
            });
        } catch (error) {
            toast.update(id, {
                render: "Không thể tải xuống trực tiếp. Đang mở trong tab mới...",
                type: "warning",
                isLoading: false,
                autoClose: 3000
            });
            window.open(signatureUrl, "_blank");
        }
    };

    const isPending = isUpdating || isDetailsLoading;

    const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

    return (
        <>
            <Dialog open={isOpen && !isPermissionsDialogOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent size="medium">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-accent">
                            <Icon path={mdiClipboardAccount} size={0.8} className="flex-shrink-0" />
                            <span>
                                {isEditing
                                    ? `Cập nhật nhân viên: ${employeeData?.fullName || ""}`
                                    : `Chi tiết nhân viên: ${employeeData?.fullName || ""}`}
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                        {!isEditing ? (
                            <div className="space-y-3 md:space-y-4">
                                {isDetailsLoading ? (
                                    <div className="space-y-3 md:space-y-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <Skeleton className="h-4 w-28" />
                                                <Skeleton className="h-8 w-full" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 md:gap-4 mb-2">
                                            <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
                                            <div className="flex-1 border-b border-dashed border-accent  mr-1" />
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4 mb-2">
                                            <Card className="flex-1 p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                                <Table>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiBarcode} size={0.6} className="flex-shrink-0" />
                                                                    <span className="text-nowrap">Mã nhân viên</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="green">
                                                                    {employeeData?.employeeCode}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiAccount} size={0.6} className="flex-shrink-0" />
                                                                    <span className="text-nowrap">Họ và tên</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="neutral">
                                                                    {employeeData?.fullName}
                                                                </Badge>
                                                            </TableCell>

                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiCalendar} size={0.6} className="flex-shrink-0" />
                                                                    <span className="text-nowrap">Ngày sinh</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="neutral">
                                                                    {employeeData?.dateOfBirth
                                                                        ? new Date(employeeData.dateOfBirth).toLocaleDateString("vi-VN")
                                                                        : "-"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiCardAccountDetailsOutline} size={0.6} className="flex-shrink-0" />
                                                                    <span className="text-nowrap">Số CCCD</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="neutral">
                                                                    {employeeData?.identityCard || "-"}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiPhone} size={0.6} className="flex-shrink-0" />
                                                                    <span className="text-nowrap">Số điện thoại</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="neutral">
                                                                    {employeeData?.phoneNumber || "-"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiMapMarkerOutline} size={0.6} className="flex-shrink-0" />
                                                                    <span className="text-nowrap">Quê quán</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="neutral">{employeeData?.hometown || "-"}</Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiSchool} size={0.6} className="flex-shrink-0" />
                                                                    <span className="text-nowrap">Trình độ (Bậc)</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="neutral">{employeeData?.qualification || "Chưa cập nhật"}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiOfficeBuilding} size={0.6} className="flex-shrink-0" />
                                                                    <span className="text-nowrap">Phòng ban</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="neutral">{employeeData?.department || "-"}</Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiAccountTie} size={0.6} className="flex-shrink-0" />
                                                                    <span className="text-nowrap">Chức vụ</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-neutral-300">
                                                                {employeeData?.position || "-"}
                                                            </TableCell>
                                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiCheckCircleOutline} size={0.6} className="flex-shrink-0" />
                                                                    <span className="text-nowrap">Trạng thái</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={employeeData?.isActive ? "green" : "red"}>
                                                                    {employeeData?.isActive ? "Đang làm việc" : "Đã thôi việc"}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </Card>
                                        </div>
                                        {isAdmin && (
                                            <div className="space-y-3 md:space-y-4 mt-4">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <h3 className="text-accent font-semibold whitespace-nowrap">Chữ ký điện tử</h3>
                                                    <div className="flex-1 border-b border-dashed border-accent  mr-1" />
                                                </div>
                                                <Card className="p-4 flex flex-col items-center justify-center border-darkBorderV1">
                                                    {employeeData?.digitalSignature ? (
                                                        <div className="relative group w-fit">
                                                            <img
                                                                src={employeeData.digitalSignature}
                                                                alt="Digital Signature"
                                                                className="object-contain rounded-md"
                                                            />
                                                            <button
                                                                className="absolute flex items-center justify-center top-1 right-1 h-8 w-8 rounded-full bg-black/70 hover:bg-black/90 text-neutral-300 border-none shadow-sm"
                                                                onClick={downloadSignature}
                                                            >
                                                                <Icon path={mdiDownload} size={0.8} className="flex-shrink-0" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-neutral-300 italic text-sm">Không có chữ ký điện tử</div>
                                                    )}
                                                </Card>
                                            </div>
                                        )}
                                        {isAdmin && (
                                            <div className="space-y-3 md:space-y-4 mt-4">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin quyền hạn</h3>
                                                    <div className="flex-1 border-b border-dashed border-accent  mr-1" />
                                                </div>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    {modules.map((mod) => (
                                                        <Card key={mod.id} className="p-3 md:p-4 border-darkBorderV1/50">
                                                            <div className="flex items-center gap-2 mb-2 select-none pointer-events-none">
                                                                <Icon
                                                                    path={employeeData?.permissions?.includes(mod.id) ? mdiCheckCircle : mdiCircleOutline}
                                                                    size={0.8}
                                                                    className={employeeData?.permissions?.includes(mod.id) ? "text-accent" : "text-accent"}
                                                                />
                                                                <span className="text-sm font-bold text-accent">{mod.name}</span>
                                                            </div>

                                                            {mod.actions && (
                                                                <div className="ml-6 flex flex-wrap gap-2 mb-2">
                                                                    {mod.actions.map((action) => (
                                                                        <div key={action.id} className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent/5 border border-accent/20">
                                                                            <Icon
                                                                                path={employeeData?.permissions?.includes(action.id) ? mdiCheckCircle : mdiCircleOutline}
                                                                                size={0.6}
                                                                                className={employeeData?.permissions?.includes(action.id) ? "text-accent" : "text-neutral-400"}
                                                                            />
                                                                            <span className="text-sm font-semibold text-neutral-400">{action.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {mod.subMenu && (
                                                                <div className="ml-4 space-y-3 mt-2 border-l border-darkBorderV1/50 pl-4">
                                                                    {mod.subMenu.map((sub) => (
                                                                        <div key={sub.id} className="space-y-1.5">
                                                                            <div className="flex items-center gap-2 select-none pointer-events-none">
                                                                                <Icon
                                                                                    path={employeeData?.permissions?.includes(sub.id) ? mdiCheckCircle : mdiCircleOutline}
                                                                                    size={0.8}
                                                                                    className={employeeData?.permissions?.includes(sub.id) ? "text-accent" : "text-neutral-300"}
                                                                                />
                                                                                <span className="text-sm font-semibold text-neutral-300">{sub.name}</span>
                                                                            </div>
                                                                            {sub.actions && (
                                                                                <div className="ml-5 flex flex-wrap gap-1">
                                                                                    {sub.actions.map((action) => (
                                                                                        <div key={action.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/5 border border-accent/10">
                                                                                            <Icon
                                                                                                path={employeeData?.permissions?.includes(action.id) ? mdiCheckCircle : mdiCircleOutline}
                                                                                                size={0.6}
                                                                                                className={employeeData?.permissions?.includes(action.id) ? "text-accent" : "text-neutral-400"}
                                                                                            />
                                                                                            <span className="text-sm font-semibold text-neutral-400">{action.name}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Họ và tên</Label>
                                        <Input
                                            id="fullName"
                                            value={formData.fullName}
                                            onChange={(e) => handleChange("fullName", e.target.value)}
                                            placeholder="Nguyễn Văn A"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="employeeCode">Mã nhân viên</Label>
                                        <Input
                                            id="employeeCode"
                                            value={formData.employeeCode}
                                            onChange={(e) => handleChange("employeeCode", e.target.value)}
                                            placeholder="NV001"
                                            required
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ngày sinh</Label>
                                        <DatePicker
                                            date={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined}
                                            onDateChange={(date) => handleChange("dateOfBirth", date?.toISOString())}
                                            captionLayout="dropdown"
                                            toYear={new Date().getFullYear() + 10}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="identityCard">Số CCCD</Label>
                                        <Input
                                            id="identityCard"
                                            value={formData.identityCard}
                                            onChange={(e) => handleChange("identityCard", e.target.value)}
                                            placeholder="00120300xxxx"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Số điện thoại</Label>
                                        <Input
                                            id="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                            placeholder="0901234567"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hometown">Quê quán (Nguyên quán)</Label>
                                        <Input
                                            id="hometown"
                                            value={formData.hometown}
                                            onChange={(e) => handleChange("hometown", e.target.value)}
                                            placeholder="Đà Nẵng"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="qualification">Trình độ (Bậc)</Label>
                                        <Input
                                            id="qualification"
                                            value={formData.qualification}
                                            onChange={(e) => handleChange("qualification", e.target.value)}
                                            placeholder="Kỹ sư, 3/7..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Phòng ban</Label>
                                        <Input
                                            id="department"
                                            value={formData.department}
                                            onChange={(e) => handleChange("department", e.target.value)}
                                            placeholder="Kỹ thuật"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Chức vụ</Label>
                                        <Input
                                            id="position"
                                            value={formData.position}
                                            onChange={(e) => handleChange("position", e.target.value)}
                                            placeholder="Nhân viên"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Mật khẩu (Để trống nếu không đổi)</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => handleChange("password", e.target.value)}
                                                placeholder="********"
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
                                    {isAdmin && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Chữ ký điện tử</Label>
                                                <Card className="p-4 flex flex-col items-center justify-center min-h-[160px] border-darkBorderV1 border-dashed">
                                                    {formData.digitalSignature ? (
                                                        <div className="relative group w-full flex flex-col items-center">
                                                            <img
                                                                src={formData.digitalSignature}
                                                                alt="Signature Preview"
                                                                className="object-contain rounded-md"
                                                            />
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="red"
                                                                    onClick={() => handleChange("digitalSignature", "")}
                                                                >
                                                                    <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                                    Xóa ảnh
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="green"
                                                                    onClick={downloadSignature}
                                                                >
                                                                    <Icon path={mdiDownload} size={0.8} className="flex-shrink-0" />
                                                                    Tải xuống ảnh
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex-1 flex flex-col items-center justify-center text-neutral-300 italic text-sm text-center">
                                                            <Icon path={mdiSignatureFreehand} size={1.5} className="mb-3" />
                                                            <span>Không có chữ ký. Tải lên hoặc tạo mới bên cạnh.</span>
                                                        </div>
                                                    )}
                                                </Card>

                                                <div style={{ ...allura.style, opacity: 0, position: 'absolute', pointerEvents: 'none' }}>
                                                    {signatureText}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Tải lên file ảnh</Label>
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            accept="image/*"
                                                            onChange={handleUploadSignature}
                                                            className="hidden"
                                                        />
                                                        <div
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="cursor-pointer border-2 border-dashed border-darkBorderV1 hover:border-accent/40 hover:bg-accent/5 bg-darkCardV1/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all group min-h-40"
                                                        >
                                                            <div className="w-10 h-10 rounded-full bg-darkBorderV1/50 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                                                                <Icon path={mdiCloudUploadOutline} size={1} className="text-neutral-300 group-hover:text-accent transition-colors" />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-sm font-medium text-neutral-300">Nhấn để chọn ảnh</p>
                                                                <p className="text-sm text-neutral-300 mt-1">PNG, JPG up to 5MB</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Hoặc tạo chữ ký từ tên</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={signatureText}
                                                                onChange={(e) => setSignatureText(e.target.value)}
                                                                placeholder="Nhập tên..."
                                                            />
                                                            <Button
                                                                type="button"
                                                                onClick={generateSignatureImage}
                                                            >
                                                                <Icon path={mdiAutoFix} size={0.8} className="flex-shrink-0" />
                                                                Tạo ảnh chữ ký
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {!isEditing ? (
                            <>
                                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                    <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                    Đóng
                                </Button>
                                {canAuthor && (
                                    <Button
                                        type="button"
                                        onClick={() => setIsPermissionsDialogOpen(true)}
                                        disabled={isPending}
                                    >
                                        <Icon path={mdiShieldAccount} size={0.8} className="flex-shrink-0" />
                                        Phân quyền
                                    </Button>
                                )}
                                {canUpdate && (
                                    <Button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        disabled={isPending}
                                    >
                                        <Icon path={mdiAccountEdit} size={0.8} className="flex-shrink-0" />
                                        Cập nhật
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    disabled={isPending}
                                >
                                    <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                    Hủy
                                </Button>
                                <Button type="button" onClick={handleSubmit} disabled={isPending}>
                                    <Icon
                                        path={isPending ? mdiLoading : mdiContentSave}
                                        size={0.8}
                                    />
                                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            <EmployeePermissionsDialog
                isOpen={isPermissionsDialogOpen}
                onClose={() => setIsPermissionsDialogOpen(false)}
                employee={employeeData}
            />
        </>
    );
};
