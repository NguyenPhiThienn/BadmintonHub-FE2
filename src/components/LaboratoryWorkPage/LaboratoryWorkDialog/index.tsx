"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees } from "@/hooks/useEmployees";
import { useEquipment } from "@/hooks/useEquipment";
import { useCreateTestJob, useTestCategoryTree, useTestJobs, useUpdateTestJob } from "@/hooks/useTesting";
import { ITestCategory, ITestingDevice, ITestJob } from "@/interface/testing";
import { cn } from "@/lib/utils";
import { useTestingJobFormStore } from "@/stores/useTestingJobFormStore";
import {
    mdiAlertCircleOutline,
    mdiClose,
    mdiContentSave,
    mdiFlask,
    mdiInformationOutline,
    mdiLoading,
    mdiMagnify,
    mdiPlus,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface LaboratoryWorkDialogProps {
    isOpen: boolean;
    onClose: () => void;
    device: ITestingDevice | null;
    job?: ITestJob | null;
}

const reportOptions = [
    { label: "Cao áp (EAS_CA)", value: "EAS_CA" },
    { label: "Rơle (EAS_RL)", value: "EAS_RL" },
    { label: "Dầu (EAS_DA)", value: "EAS_DA" },
    { label: "Dụng cụ (EAS_DC)", value: "EAS_DC" },
];

export const LaboratoryWorkDialog = ({ isOpen, onClose, device, job }: LaboratoryWorkDialogProps) => {
    const {
        formData,
        activeTab,
        setFormData,
        setActiveTab,
        setTestingTools,
        setTestResults,
        resetFormData,
        setAllFormData
    } = useTestingJobFormStore();

    const { testingTools: tools, testResults } = formData;
    const deviceIdForTree = typeof device?.deviceTypeId === "string"
        ? device.deviceTypeId
        : (device?.deviceTypeId as any)?._id || "";

    const { data: categoryTreeResponse, isLoading: isLoadingTree } = useTestCategoryTree(deviceIdForTree);
    const categoryTree = (categoryTreeResponse?.data || []) as ITestCategory[];

    const { data: employeesResponse } = useEmployees({ page: 1, limit: 1000 });
    const employees = employeesResponse?.data?.employees || [];

    const { data: equipmentResponse } = useEquipment({ page: 1, limit: 1000 });
    const equipments = (equipmentResponse?.data?.equipment || []).filter((eq: any) =>
        (eq.equipmentName || "").toUpperCase().includes("TB") ||
        (eq.equipmentCode || "").toUpperCase().includes("TB")
    );

    const [toolSearch, setToolSearch] = useState("");
    const filteredEquipments = equipments.filter((eq: any) =>
        (eq.equipmentName || "").toLowerCase().includes(toolSearch.toLowerCase()) ||
        (eq.equipmentCode || "").toLowerCase().includes(toolSearch.toLowerCase())
    );

    const { data: jobsResponse } = useTestJobs({ limit: 1 });
    const totalJobs = jobsResponse?.pagination?.total || 0;
    const nextIndex = String(totalJobs + 1).padStart(2, '0');

    const { mutate: createJob, isPending: isCreating } = useCreateTestJob();
    const { mutate: updateJob, isPending: isUpdating } = useUpdateTestJob();
    const isPending = isCreating || isUpdating;

    // Reset or Populate form
    useEffect(() => {
        if (!isOpen) return;

        if (job) {
            // Populate for edit
            setAllFormData({
                deviceId: typeof job.deviceId === 'string' ? job.deviceId : job.deviceId?._id || "",
                projectName: job.projectName || "",
                site: job.site || "",
                reportNumber: job.reportNumber || "",
                testDate: job.testDate ? format(new Date(job.testDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
                testType: job.testType || "Định kỳ",
                reinforcementContent: job.reinforcementContent || "",
                temperature: job.temperature || "",
                humidity: job.humidity || "",
                testerName: job.testerName || "",
                approverName: job.approverName || "",
                status: job.status || "Đạt",
                conclusion: job.conclusion || "",
                failReason: job.failReason || "",
                notes: job.notes || "",
                purpose: (job as any)?.purpose || "",
                testingTools: job.testingTools ? job.testingTools.split("; ") : [""],
                testResults: job.testResults || {},
            });
        } else if (device && device._id !== formData.deviceId) {
            // Reset for create
            resetFormData(device._id);
            setFormData({ site: (device as any).site || "" });
        }
    }, [isOpen, device, job, formData.deviceId, resetFormData, setAllFormData]);

    const handleInfoChange = (field: string, value: any) => {
        setFormData({ [field]: value });
    };

    const handleAddTool = () => setTestingTools([...tools, ""]);
    const handleUpdateTool = (index: number, value: string) => {
        const newTools = [...tools];
        newTools[index] = value;
        setTestingTools(newTools);
    };
    const handleRemoveTool = (index: number) => {
        if (tools.length > 1) {
            setTestingTools(tools.filter((_, i) => i !== index));
        }
    };

    const handleResultChange = (categoryId: string, field: string, value: any) => {
        const currentResults = useTestingJobFormStore.getState().formData.testResults;
        setTestResults({
            ...currentResults,
            [categoryId]: {
                ...(currentResults[categoryId] || { evaluation: "", isSkipped: false, value: "" }),
                [field]: value
            }
        });
    };

    const renderSerialInfo = () => {
        if (!device?.serialJson) return null;
        try {
            const serial = typeof device.serialJson === 'string' ? JSON.parse(device.serialJson) : device.serialJson;
            const rows = serial.rows || 1;
            const cols = serial.cols || 1;
            const data = serial.data || {};

            return (
                <div className="md:col-span-2 space-y-2">
                    <Label>Thông tin Serial</Label>
                    <div className="overflow-x-auto border border-darkBorderV1 rounded-md">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="border border-darkBorderV1 p-2 text-center w-12 text-neutral-400 font-semibold">#</th>
                                    {Array.from({ length: cols }).map((_, cIdx) => (
                                        <th key={cIdx} className="border border-darkBorderV1 p-2 text-center text-accent font-semibold">
                                            Cột {cIdx + 1}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: rows }).map((_, rIdx) => {
                                    const r = rIdx + 1;
                                    return (
                                        <tr key={rIdx}>
                                            <td className="border border-darkBorderV1 p-2 text-center font-semibold text-accent bg-white/5">
                                                H{r}
                                            </td>
                                            {Array.from({ length: cols }).map((_, cIdx) => {
                                                const c = cIdx + 1;
                                                const val = data[`serial_${r}_${c}`] || data[`serial_${r}-${c}`] || data[`serial_${c}_${r}`] || "";
                                                return (
                                                    <td key={cIdx} className="border border-darkBorderV1 p-2 text-center text-neutral-300 min-w-[120px]">
                                                        {val}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } catch (e) {
            return null;
        }
    };

    const handleSubmit = () => {
        if (!device && !job) return;

        // Validation chi tiết tương tự AddJobDialog
        if (!formData.projectName?.trim()) {
            toast.warning("Vui lòng nhập tên dự án/tên trạm");
            return;
        }

        if (!formData.site?.trim()) {
            toast.warning("Vui lòng nhập vị trí lắp đặt (Site)");
            return;
        }

        if (!formData.reportNumber?.trim()) {
            toast.warning("Vui lòng nhập số biên bản");
            return;
        }

        if (!formData.testDate) {
            toast.warning("Vui lòng chọn ngày thí nghiệm");
            return;
        }

        if (!formData.testType) {
            toast.warning("Vui lòng chọn loại thí nghiệm");
            return;
        }

        if (formData.testType === "Tăng cường" && !formData.reinforcementContent?.trim()) {
            toast.warning("Vui lòng nhập nội dung tăng cường");
            return;
        }

        if (!formData.temperature?.toString().trim()) {
            toast.warning("Vui lòng nhập nhiệt độ thí nghiệm");
            return;
        }

        if (!formData.humidity?.toString().trim()) {
            toast.warning("Vui lòng nhập độ ẩm môi trường");
            return;
        }

        const validTools = tools.filter(t => t.trim());
        if (validTools.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một dụng cụ thí nghiệm");
            return;
        }

        if (!formData.testerName) {
            toast.warning("Vui lòng chọn người thực hiện thí nghiệm");
            return;
        }

        if (!formData.approverName) {
            toast.warning("Vui lòng chọn người kiểm duyệt biên bản");
            return;
        }

        if (!formData.status) {
            toast.warning("Vui lòng chọn đánh giá kết quả (Đạt/Không đạt)");
            return;
        }

        if (formData.status === "Không đạt" && !formData.failReason?.trim()) {
            toast.warning("Vui lòng nhập lý do đánh giá không đạt");
            return;
        }

        if (!formData.purpose?.trim()) {
            toast.warning("Vui lòng nhập lý do/mục đích thí nghiệm");
            return;
        }

        const payload = {
            ...formData,
            deviceId: job ? (typeof job.deviceId === 'string' ? job.deviceId : job.deviceId?._id) : device?._id,
            testingTools: validTools.join("; "),
        };

        if (job) {
            updateJob({ id: job._id, data: payload }, {
                onSuccess: () => {
                    resetFormData();
                    onClose();
                }
            });
        } else {
            createJob(payload, {
                onSuccess: () => {
                    resetFormData();
                    onClose();
                }
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium" className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiFlask} size={0.8} />
                        <span>Cập nhật công việc thí nghiệm</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="info">
                                <Icon path={mdiInformationOutline} size={0.8} className="flex-shrink-0" />
                                Thông tin chung
                            </TabsTrigger>
                            <TabsTrigger value="results">
                                <Icon path={mdiFlask} size={0.8} className="flex-shrink-0" />
                                Kết quả Thí nghiệm
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="info">
                            {/* Device Info Summary */}
                            <div className="bg-darkBackgroundV1 p-3 rounded-lg border border-darkBorderV1 flex items-center gap-3 text-sm">
                                <Icon path={mdiInformationOutline} size={0.8} className="text-accent" />
                                <div className="flex items-center gap-1">
                                    <Badge variant="green">Thiết bị:</Badge> <Badge variant="neutral">{device?.operatingName}</Badge>
                                    <span className="text-neutral-300 ">--</span> <Badge variant="green">Đơn vị:</Badge> <Badge variant="neutral">{typeof device?.partnerId === 'object' ? (device?.partnerId as any)?.partnerName : ""}</Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2 space-y-1">
                                        <Label>Tên dự án/tên trạm (Project) <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="Ví dụ: TBA 220kV Lao Bảo"
                                            value={formData.projectName}
                                            onChange={(e) => handleInfoChange("projectName", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Số biên bản <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={formData.reportNumber?.split('/')?.[1] || ""}
                                            onValueChange={(type: string) => {
                                                const currentNumber = formData.reportNumber?.split('/')?.[0] || nextIndex;
                                                handleInfoChange("reportNumber", `${currentNumber}/${type}`);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại...">
                                                    {formData.reportNumber || "Chọn loại..."}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {reportOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                                    <div className="space-y-1">
                                        <Label>Ngày thí nghiệm (Date) <span className="text-red-500">*</span></Label>
                                        <DatePicker
                                            date={formData.testDate ? new Date(formData.testDate) : undefined}
                                            onDateChange={(d) => handleInfoChange("testDate", d ? format(d, "yyyy-MM-dd") : undefined)}
                                            captionLayout="dropdown"
                                            toYear={new Date().getFullYear() + 10}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Loại thí nghiệm <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={formData.testType}
                                            onValueChange={(v: string) => handleInfoChange("testType", v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Định kỳ">Định kỳ</SelectItem>
                                                <SelectItem value="Sau lắp đặt">Sau lắp đặt</SelectItem>
                                                <SelectItem value="Đột xuất">Đột xuất</SelectItem>
                                                <SelectItem value="Tăng cường">Tăng cường</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Nội dung tăng cường</Label>
                                        <Input
                                            placeholder="Ví dụ: Thử nghiệm sau sự cố"
                                            value={formData.reinforcementContent}
                                            onChange={(e) => handleInfoChange("reinforcementContent", e.target.value)}
                                            disabled={formData.testType !== "Tăng cường"}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                                    <div className="space-y-1">
                                        <Label>Nhiệt độ (&#8451;) <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="VD: 35"
                                            value={formData.temperature}
                                            onChange={(e) => handleInfoChange("temperature", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Độ ẩm (%) <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="VD: 75"
                                            value={formData.humidity}
                                            onChange={(e) => handleInfoChange("humidity", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Dụng cụ thí nghiệm <span className="text-red-500">*</span></Label>
                                        <Button size="icon" variant="ghost" onClick={handleAddTool}>
                                            <Icon path={mdiPlus} size={0.8} />
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {tools.map((tool, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Select
                                                    value={tool}
                                                    onValueChange={(v: string) => handleUpdateTool(index, v)}
                                                    onOpenChange={(open) => !open && setToolSearch("")}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn dụng cụ..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <div className="sticky top-0 z-10 bg-darkCardV1 p-2 border-b border-darkBorderV1 mb-1">
                                                            <div className="relative">
                                                                <Icon path={mdiMagnify} size={0.8} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                                <Input
                                                                    placeholder="Tìm mã hoặc tên dụng cụ..."
                                                                    value={toolSearch}
                                                                    onChange={(e) => setToolSearch(e.target.value)}
                                                                    onKeyDown={(e) => e.stopPropagation()}
                                                                    className="pl-8 py-2 w-full bg-transparent"
                                                                />
                                                            </div>
                                                        </div>
                                                        {filteredEquipments.length > 0 ? (
                                                            filteredEquipments.map((eq: any) => (
                                                                <SelectItem key={eq._id} value={eq.equipmentName}>
                                                                    <div className="flex items-center justify-between w-full gap-2">
                                                                        <span>{eq.equipmentName}</span>
                                                                        <Badge variant="green">({eq.equipmentCode})</Badge>
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            toolSearch && (
                                                                <div className="py-4 text-center text-sm text-neutral-400 italic">
                                                                    Không tìm thấy kết quả
                                                                </div>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {tools.length > 1 && (
                                                    <Button size="icon" variant="ghost" className="shrink-0" onClick={() => handleRemoveTool(index)}>
                                                        <Icon path={mdiTrashCanOutline} size={0.8} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            Người thí nghiệm <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={formData.testerName}
                                            onValueChange={(v: string) => handleInfoChange("testerName", v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn nhân viên..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.map((emp: any) => (
                                                    <SelectItem key={emp._id} value={emp.fullName}>{emp.fullName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            Người kiểm duyệt <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={formData.approverName}
                                            onValueChange={(v: string) => handleInfoChange("approverName", v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn nhân viên..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.map((emp: any) => (
                                                    <SelectItem key={emp._id} value={emp.fullName}>{emp.fullName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Serial Preview section */}
                                {renderSerialInfo()}

                                <div className="md:col-span-2 flex items-center gap-3 md:gap-4 w-full">
                                    <div className="flex flex-col gap-2">
                                        <Label>Đánh giá kết quả <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(v: string) => handleInfoChange("status", v)}
                                        >
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Đạt">ĐẠT</SelectItem>
                                                <SelectItem value="Không đạt">KHÔNG ĐẠT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Kết luận chi tiết (Conclusion)</Label>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            handleInfoChange("conclusion", "Các hạng mục đã thí nghiệm đạt yêu cầu kỹ thuật. (All testes have been performed completely according to test standard and pass)");
                                                        }
                                                    }}
                                                />
                                                <Label>Kết luận thường dùng</Label>
                                            </div>
                                        </div>
                                        <Input
                                            placeholder="Ví dụ: Thiết bị đủ tiêu chuẩn vận hành"
                                            value={formData.conclusion}
                                            onChange={(e) => handleInfoChange("conclusion", e.target.value)}
                                        />
                                    </div>
                                </div>
                                {formData.status === "Không đạt" && (
                                    <div className="md:col-span-2 flex flex-col gap-2 w-full">
                                        <Label className="text-red-400">Lý do không đạt</Label>
                                        <Textarea
                                            rows={2}
                                            placeholder="Ví dụ: Chỉ số cách điện thấp hơn tiêu chuẩn"
                                            value={formData.failReason}
                                            onChange={(e) => handleInfoChange("failReason", e.target.value)}
                                        />
                                    </div>
                                )}
                                <div className="md:col-span-2 flex flex-col gap-2 w-full">
                                    <Label>Lý do thí nghiệm (Purpose of test) <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        rows={2}
                                        placeholder="Ví dụ: Thí nghiệm định kỳ theo quy trình"
                                        value={formData.purpose}
                                        onChange={(e) => handleInfoChange("purpose", e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-2 w-full">
                                    <Label>Ghi chú (Remark)</Label>
                                    <Textarea
                                        rows={2}
                                        placeholder="Ví dụ: Kiểm tra thêm vào tuần sau"
                                        value={formData.notes}
                                        onChange={(e) => handleInfoChange("notes", e.target.value)}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="results">
                            {isLoadingTree ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-400 italic">
                                    <Icon path={mdiLoading} size={1.2} className="animate-spin" />
                                    <p>Đang tải danh sách hạng mục...</p>
                                </div>
                            ) : categoryTree.length === 0 ? (
                                <div className="py-12 text-center text-neutral-400 italic">
                                    Không có hạng mục thí nghiệm nào cho loại thiết bị này.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {categoryTree.map((category, index) => (
                                        <TestCategorySection
                                            key={category._id}
                                            category={category}
                                            results={testResults}
                                            onChange={(id: string, field: string, value: any) => handleResultChange(id, field, value)}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
                <DialogFooter className="border-t border-darkBorderV1 pt-4 mt-2">
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? <Icon path={mdiLoading} size={0.8} className="animate-spin" /> : <Icon path={mdiContentSave} size={0.8} />}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface TestCategorySectionProps {
    category: ITestCategory;
    results: any;
    onChange: (id: string, field: string, value: any) => void;
    index: number;
    prefix?: string;
}

const TestCategorySection = ({ category, results, onChange, index, prefix = "" }: TestCategorySectionProps) => {
    const categoryResult = results[category._id] || { evaluation: "", isSkipped: false, value: "" };
    const isRoot = category.parentId === null;
    const currentNumber = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;

    const handleEvalChange = (v: string) => {
        onChange(category._id, "evaluation", v);
        // Cascade "Đạt" to all descendants
        const cascadeEval = (cat: ITestCategory) => {
            cat.children?.forEach(child => {
                onChange(child._id, "evaluation", "Đạt");
                cascadeEval(child);
            });
        };
        if (v === "Đạt" && category.children?.length) {
            cascadeEval(category);
        }
    };

    const handleSkipChange = (checked: boolean) => {
        // Recursive skip cascade to all descendants
        const cascadeSkip = (cat: ITestCategory) => {
            onChange(cat._id, "isSkipped", checked);
            if (cat.children?.length) {
                cat.children.forEach(child => cascadeSkip(child));
            }
        };
        cascadeSkip(category);
    };

    if (isRoot) {
        return (
            <Card className="mb-4 border-accent/30 overflow-hidden bg-darkCardV1">
                {/* Parent Header */}
                <div className="bg-darkBackgroundV1 border-b border-accent/20 p-3 py-2 flex flex-wrap items-center justify-between gap-3">
                    <Select value={categoryResult.evaluation} onValueChange={handleEvalChange} disabled={categoryResult.isSkipped}>
                        <SelectTrigger className="w-[170px]">
                            <SelectValue placeholder="-- Đánh giá --" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Đạt">Đạt</SelectItem>
                            <SelectItem value="Không Đạt">Không Đạt</SelectItem>
                            <SelectItem value="Xem Ghi Chú">Xem Ghi Chú</SelectItem>
                        </SelectContent>
                    </Select>
                    <h6 className="font-semibold text-neutral-300 mb-0 text-sm flex-1 text-wrap">{currentNumber}. {category.name}</h6>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-300 uppercase font-semibold">Không thực hiện</span>
                        <Switch checked={categoryResult.isSkipped} onCheckedChange={handleSkipChange} />
                    </div>
                </div>

                {/* Parent Body */}
                <CardContent className="p-3 relative">
                    {categoryResult.isSkipped && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-darkBackgroundV1/40 backdrop-blur-[1px]">
                            <Badge variant="red">
                                <Icon path={mdiAlertCircleOutline} size={0.6} className="mr-1" />
                                Hạng mục này không thực hiện.
                            </Badge>
                        </div>
                    )}

                    <div className={cn("space-y-4", categoryResult.isSkipped && "opacity-40 grayscale-[0.3]")}>
                        {/* If Root has no children but is an input field */}
                        {(!category.children || category.children.length === 0) && (
                            <ResultInputControl
                                category={category}
                                value={categoryResult.value}
                                onChange={(val) => onChange(category._id, "value", val)}
                            />
                        )}

                        {/* Recursive children */}
                        {category.children?.map((child, i) => (
                            <TestCategorySection
                                key={child._id}
                                category={child}
                                results={results}
                                onChange={onChange}
                                index={i}
                                prefix={currentNumber}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Child Item (Nested)
    return (
        <div className={cn("mb-4 pb-4 border-b border-darkBorderV1 last:border-0 last:mb-0 last:pb-0 relative")}>
            <div className="flex items-center justify-between gap-3 mb-2">
                <Select value={categoryResult.evaluation} onValueChange={handleEvalChange} disabled={categoryResult.isSkipped}>
                    <SelectTrigger className="w-[170px]">
                        <SelectValue placeholder="-- Đánh giá --" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Đạt">Đạt</SelectItem>
                        <SelectItem value="Không Đạt">Không Đạt</SelectItem>
                        <SelectItem value="Xem Ghi Chú">Xem Ghi Chú</SelectItem>
                    </SelectContent>
                </Select>
                <Label className="font-semibold text-neutral-300 mb-0 flex-1 text-wrap normal-case text-sm">{currentNumber}. {category.name}</Label>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-300 uppercase font-semibold">Bỏ qua</span>
                    <Switch checked={categoryResult.isSkipped} onCheckedChange={handleSkipChange} />
                </div>
            </div>

            <div className={cn("space-y-4 relative", categoryResult.isSkipped && "pointer-events-none")}>
                {!categoryResult.isSkipped ? (
                    <>
                        <ResultInputControl
                            category={category}
                            value={categoryResult.value}
                            onChange={(val) => onChange(category._id, "value", val)}
                        />
                        {/* Nested children if any */}
                        {category.children && category.children.length > 0 && (
                            <div className="ml-3 pl-3 border-l border-darkBorderV1 space-y-4">
                                {category.children.map((child, i) => (
                                    <TestCategorySection
                                        key={child._id}
                                        category={child}
                                        results={results}
                                        onChange={onChange}
                                        index={i}
                                        prefix={currentNumber}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <Badge variant="red">
                        <Icon path={mdiAlertCircleOutline} size={0.6} className="mr-1" />
                        Hạng mục này không thực hiện.
                    </Badge>
                )}
            </div>
        </div>
    );
};

const AutoResizeTextarea = ({ value, onChange, placeholder, className, ...props }: any) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useLayoutEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            className={cn("w-full bg-transparent border-none focus:ring-1 focus:ring-accent rounded px-2 py-1 text-center text-neutral-300 placeholder:text-neutral-400 outline-none resize-none overflow-hidden min-h-[34px] leading-relaxed block", className)}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={1}
            {...props}
        />
    );
};

const ResultInputControl = ({ category, value, onChange }: { category: ITestCategory, value: any, onChange: (v: any) => void }) => {
    if (category.contentType === "TEXT") {
        return <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Ví dụ: Nhập kết quả..." />;
    }
    if (category.contentType === "NUMBER") {
        return <Input type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Ví dụ: 0.0" />;
    }
    if (category.contentType === "DROPDOWN") {
        const options = Array.isArray(category.config) ? category.config : [];
        return (
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Chọn kết quả..." />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt: any, i: number) => (
                        <SelectItem key={i} value={opt.value || opt.Value}>{opt.text || opt.Text}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }
    if (category.contentType === "TABLE") {
        return <DynamicTableControl config={category.config} value={value} onChange={onChange} />;
    }
    if (category.contentType === "MERGE_TABLE") {
        return <MergeTableControl config={category.config} value={value} onChange={onChange} />;
    }
    return null;
};

const MergeTableControl = ({ config, value, onChange }: { config: any, value: any, onChange: (v: any) => void }) => {
    // config structure: { rows: number, cols: number, cells: ITableCell[][] }
    if (!config || !config.cells) return <Badge variant="red">Thiếu cấu hình bảng</Badge>;

    const { rows, cols, cells } = config;
    const values = value || {}; // Stores input values by cell ID

    const handleValueChange = (cellId: string, val: string) => {
        onChange({ ...values, [cellId]: val });
    };

    return (
        <div className="overflow-auto border border-darkBorderV1 rounded-md bg-darkBackgroundV1 p-2 custom-scrollbar">
            <table className="border-collapse table-fixed mx-auto" style={{ width: `${cols * 150}px`, minWidth: '100%' }}>
                <colgroup>
                    {Array.from({ length: cols }).map((_, i) => (
                        <col key={i} style={{ width: '150px' }} />
                    ))}
                </colgroup>
                <tbody>
                    {cells.map((rowArr: any[], rIndex: number) => (
                        <tr key={`r-${rIndex}`}>
                            {rowArr.map((cell: any) => {
                                if (cell.isMergedOut) return null;

                                return (
                                    <td
                                        key={cell.id}
                                        rowSpan={cell.rowSpan}
                                        colSpan={cell.colSpan}
                                        className={cn(
                                            "relative border border-darkBorderV1 min-w-[150px] p-2 transition-colors",
                                            cell.type === "label" ? "bg-darkBackgroundV1/30" : "bg-transparent"
                                        )}
                                        style={{ height: '48px' }}
                                    >
                                        <div className="w-full h-full flex flex-col justify-center items-center">
                                            {cell.type === "label" && cell.value.trim() !== "" ? (
                                                <span className="text-sm font-semibold text-accent text-center break-words max-w-full">
                                                    {cell.value}
                                                </span>
                                            ) : (
                                                <AutoResizeTextarea
                                                    value={values[cell.id]}
                                                    onChange={(val: string) => handleValueChange(cell.id, val)}
                                                    placeholder="..."
                                                    className="text-sm font-medium"
                                                />
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const DynamicTableControl = ({ config, value, onChange }: { config: any, value: any, onChange: (v: any) => void }) => {
    const columns = Array.isArray(config) ? config : [];
    const rows = Array.isArray(value) ? value : [{}];

    const handleCellChange = (rowIndex: number, colName: string, val: string) => {
        const newRows = [...rows];
        newRows[rowIndex] = { ...newRows[rowIndex], [colName]: val };
        onChange(newRows);
    };

    const addRow = () => onChange([...rows, {}]);
    const removeRow = (index: number) => {
        if (rows.length > 1) {
            onChange(rows.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="space-y-4 md:space-y-4 pt-2">
            <div className="overflow-x-auto border border-darkBorderV1 rounded-none">
                <table className="w-full text-sm text-center border-collapse">
                    <thead>
                        <tr className="bg-darkBackgroundV1/50">
                            <th className="p-2 border border-darkBorderV1 text-neutral-400 w-12 font-semibold">#</th>
                            {columns.map((col: any, i: number) => (
                                <th key={i} className="p-2 border border-darkBorderV1 text-accent font-semibold">
                                    {(col.name || col.Name)} {(col.unit || col.Unit) && <span className="text-sm text-neutral-400 font-normal italic">({col.unit || col.Unit})</span>}
                                </th>
                            ))}
                            <th className="p-1 border border-darkBorderV1 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rIndex) => (
                            <tr key={rIndex}>
                                <td className="p-2 border border-darkBorderV1 bg-darkBackgroundV1/50 text-neutral-400 font-medium">{rIndex + 1}</td>
                                {columns.map((col: any, cIndex: number) => {
                                    const cName = col.name || col.Name;
                                    return (
                                        <td key={cIndex} className="p-1 border border-darkBorderV1 bg-transparent">
                                            <AutoResizeTextarea
                                                value={row[cName]}
                                                onChange={(val: any) => handleCellChange(rIndex, cName, val)}
                                                placeholder="..."
                                            />
                                        </td>
                                    );
                                })}
                                <td className="p-1 border border-darkBorderV1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRow(rIndex)}
                                    >
                                        <Icon path={mdiTrashCanOutline} size={0.8} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Button
                variant="outline"
                onClick={addRow}
            >
                <Icon path={mdiPlus} size={0.8} />
                Thêm dòng
            </Button>
        </div>
    );
};
