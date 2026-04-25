"use client";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useEmployees } from "@/hooks/useEmployees";
import { useCreateLog } from "@/hooks/useTasks";
import { useConstructionLogsForm } from "@/stores/useConstructionLogsForm";
import { mdiClose, mdiLoading, mdiNotebookPlus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { format as formatFns, parseISO } from "date-fns";
import { toast } from "react-toastify";

interface CreateConstructionLogDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateConstructionLogDialog({ isOpen, onClose }: CreateConstructionLogDialogProps) {
    const { mutate: createLog, isPending: isCreating } = useCreateLog();

    const { data: employeesResponse } = useEmployees({ limit: 1000, isActive: true });
    const employees = employeesResponse?.data?.employees || [];

    const { formData, setFormData, resetFormData } = useConstructionLogsForm();

    const sEval = formData.supervisorEvaluation ?? {
        isScheduleOnTrack: false,
        isSufficientLaborAndEquipment: false,
        isConstructionQualityGood: false,
        laborSafetyStatus: "Bình thường" as const,
        environmentalSanitationStatus: "Bình thường" as const,
        nextDayWorkProposals: "",
        progressProposals: "",
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        const missingFields: string[] = [];
        if (!formData.projectName.trim()) missingFields.push("Dự án");
        if (!formData.constructionName.trim()) missingFields.push("Hạng mục");
        if (!formData.location.trim()) missingFields.push("Địa điểm");
        if (!formData.workDescription.trim()) missingFields.push("MỤC 7. Công việc thực hiện trong ngày");
        if (!formData.logDate) missingFields.push("MỤC 1. Ngày lập");
        if (!formData.commander) missingFields.push("MỤC 2. Người ghi nhật ký");

        if (missingFields.length > 0) {
            toast.warning(
                <div>
                    <p className="font-semibold mb-1">Vui lòng điền đủ thông tin:</p>
                    <ul className="list-disc ml-4 text-sm">
                        {missingFields.map((field, index) => (
                            <li key={index}>{field}</li>
                        ))}
                    </ul>
                </div>
            );
            return;
        }

        createLog(formData, {
            onSuccess: () => {
                toast.success("Tạo nhật ký thi công thành công!");
                resetFormData();
                onClose();
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi tạo nhật ký!");
            },
        });
    };

    const formatTime = (h: number) => {
        const hours = Math.floor(h);
        const minutes = (h % 1) * 60;
        return `${hours}h${minutes === 0 ? "00" : minutes}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiNotebookPlus} size={0.8} className="flex-shrink-0" />
                        <span>Tạo nhật ký thi công</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="create-log-form" onSubmit={handleSubmit} className="space-y-4">

                        {/* Section 1: Thông tin dự án */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin dự án &amp; công trình</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-1">
                                    <Label>Dự án</Label>
                                    <Input
                                        value={formData.projectName}
                                        onChange={(e) => setFormData({ projectName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Hạng mục</Label>
                                    <Input
                                        value={formData.constructionName}
                                        onChange={(e) => setFormData({ constructionName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Địa điểm</Label>
                                    <Input
                                        value={formData.location}
                                        onChange={(e) => setFormData({ location: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Chủ đầu tư</Label>
                                    <Input
                                        value={formData.investor}
                                        onChange={(e) => setFormData({ investor: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Đơn vị giám sát</Label>
                                    <Input
                                        value={formData.supervisionConsultingUnit}
                                        onChange={(e) => setFormData({ supervisionConsultingUnit: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Bên thi công</Label>
                                    <Input
                                        value={formData.constructionContractor}
                                        onChange={(e) => setFormData({ constructionContractor: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Nhật ký thi công */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Nhật ký thi công xây dựng công trình</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-4">
                                    {/* MỤC 1 */}
                                    <div className="space-y-1">
                                        <Label>MỤC 1. Ngày lập</Label>
                                        <DatePicker
                                            date={formData.logDate ? parseISO(formData.logDate) : undefined}
                                            onDateChange={(date) => setFormData({
                                                logDate: date ? formatFns(date, "yyyy-MM-dd") : ""
                                            })}
                                            captionLayout="dropdown"
                                            toYear={new Date().getFullYear() + 10}
                                        />
                                    </div>
                                    {/* MỤC 2 */}
                                    <div className="space-y-1">
                                        <Label>MỤC 2. Người ghi nhật ký</Label>
                                        <Select
                                            value={formData.commander}
                                            onValueChange={(v) => setFormData({ commander: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn người ghi nhật ký" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.map((emp: any) => (
                                                    <SelectItem key={emp._id} value={emp._id}>
                                                        {emp.fullName} ({emp.employeeCode})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-4">
                                        <Label>
                                            <span>MỤC 1.1. Ca sáng</span>
                                            <span className="text-accent ml-2">{formatTime(formData.workingHours.morning.start)} - {formatTime(formData.workingHours.morning.end)}</span>
                                        </Label>
                                        <Slider
                                            min={4} max={12.5} step={0.5}
                                            value={[formData.workingHours.morning.start, formData.workingHours.morning.end]}
                                            onValueChange={([start, end]) => setFormData({
                                                workingHours: { ...formData.workingHours, morning: { start, end } }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label>
                                            <span>MỤC 1.2. Ca chiều</span>
                                            <span className="text-accent ml-2">{formatTime(formData.workingHours.afternoon.start)} - {formatTime(formData.workingHours.afternoon.end)}</span>
                                        </Label>
                                        <Slider
                                            min={12.5} max={22} step={0.5}
                                            value={[formData.workingHours.afternoon.start, formData.workingHours.afternoon.end]}
                                            onValueChange={([start, end]) => setFormData({
                                                workingHours: { ...formData.workingHours, afternoon: { start, end } }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* MỤC 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-1">
                                    <Label>MỤC 3. Tình hình thời tiết</Label>
                                    <Input
                                        value={formData.weather}
                                        onChange={(e) => setFormData({ weather: e.target.value })}
                                        placeholder="VD: Nắng, Mưa..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Nhiệt độ (°C)</Label>
                                    <QuantityInput
                                        value={formData.temperature}
                                        onChange={(val) => setFormData({ temperature: val })}
                                    />
                                </div>
                            </div>
                            {/* MỤC 4 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-1">
                                    <Label>MỤC 4. Đơn vị giám sát</Label>
                                    <Input
                                        value={formData.supervisionUnit}
                                        onChange={(e) => setFormData({ supervisionUnit: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Người giám sát</Label>
                                    <Input
                                        value={formData.supervisorName}
                                        onChange={(e) => setFormData({ supervisorName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {/* MỤC 5 */}
                                <div className="space-y-1">
                                    <Label>MỤC 5. Lực lượng công nhân xây lắp</Label>
                                    <QuantityInput
                                        value={formData.employeeCount}
                                        onChange={(val) => setFormData({ employeeCount: val })}
                                    />
                                </div>
                                {/* MỤC 6 */}
                                <div className="space-y-1">
                                    <Label>MỤC 6. Liệt kê máy móc thi công</Label>
                                    <Input
                                        value={formData.equipmentUsed}
                                        onChange={(e) => setFormData({ equipmentUsed: e.target.value })}
                                        placeholder="VD: Máy xúc, búa, khoan..."
                                    />
                                </div>
                            </div>
                            {/* MỤC 7 */}
                            <div className="space-y-1">
                                <Label>MỤC 7. Công việc thực hiện trong ngày</Label>
                                <RichTextEditor
                                    value={formData.workDescription}
                                    onChange={(val) => setFormData({ workDescription: val })}
                                    placeholder="Nhập chi tiết các hạng mục đã thi công trong ngày..."
                                />
                            </div>
                            {/* MỤC 8 */}
                            <div className="space-y-1">
                                <Label>MỤC 8. Khối lượng thi công trong ngày</Label>
                                <RichTextEditor
                                    value={formData.dailyWorkVolume}
                                    onChange={(val) => setFormData({ dailyWorkVolume: val })}
                                    placeholder="VD: 100m3 bê tông cốt thép..."
                                />
                            </div>
                            {/* MỤC 9 */}
                            <div className="space-y-1">
                                <Label>MỤC 9. Liệt kê các hạng mục công việc chính bắt đầu triển khai/hoặc hoàn thành đến ngày ghi nhật ký</Label>
                                <RichTextEditor
                                    value={formData.mainWorkItems}
                                    onChange={(val) => setFormData({ mainWorkItems: val })}
                                    placeholder="VD: Đổ bê tông sàn tầng 2, lắp dựng cốp pha..."
                                />
                            </div>
                            {/* MỤC 10 */}
                            <div className="space-y-1">
                                <Label>MỤC 10. Tình hình bàn giao vật tư cho bên B</Label>
                                <RichTextEditor
                                    value={formData.materialsHandoverB}
                                    onChange={(val) => setFormData({ materialsHandoverB: val })}
                                    placeholder="VD: Đã bàn giao đầy đủ thép và xi măng theo kế hoạch..."
                                />
                            </div>
                            {/* MỤC 11 */}
                            <div className="space-y-1">
                                <Label>MỤC 11. Công tác nghiệm thu chuyển giai đoạn thi công</Label>
                                <RichTextEditor
                                    value={formData.transitionalAcceptance}
                                    onChange={(val) => setFormData({ transitionalAcceptance: val })}
                                    placeholder="VD: Đã nghiệm thu cốt thép sàn trước khi đổ bê tông..."
                                />
                            </div>

                            {/* MỤC 12 */}
                            <div className="space-y-1">
                                <Label>MỤC 12. Các lưu ý của giám sát A đối với nhà thầu</Label>
                                <RichTextEditor
                                    value={formData.supervisorNotes}
                                    onChange={(val) => setFormData({ supervisorNotes: val })}
                                    placeholder="Nhập các lưu ý của giám sát A..."
                                />
                            </div>

                            {/* MỤC 13 */}
                            <div className="space-y-3">
                                <Label>MỤC 13. Đánh giá của giám sát A</Label>
                                <div className="flex items-center justify-between gap-4">
                                    <Label>MỤC 13.1. Tiến độ công việc có đáp ứng tiến độ thỏa thuận</Label>
                                    <RadioGroup
                                        value={sEval.isScheduleOnTrack ? "true" : "false"}
                                        onValueChange={(v) => setFormData({ supervisorEvaluation: { isScheduleOnTrack: v === "true" } })}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center gap-1">
                                            <RadioGroupItem value="true" id="sot-yes" className="w-5 h-5" />
                                            <Label htmlFor="sot-yes" className="cursor-pointer">Có</Label>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <RadioGroupItem value="false" id="sot-no" className="w-5 h-5" />
                                            <Label htmlFor="sot-no" className="cursor-pointer">Không</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Label>MỤC 13.2. Nhà thầu có bố trí đủ nhân lực và máy móc theo cam kết</Label>
                                    <RadioGroup
                                        value={sEval.isSufficientLaborAndEquipment ? "true" : "false"}
                                        onValueChange={(v) => setFormData({ supervisorEvaluation: { isSufficientLaborAndEquipment: v === "true" } })}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center gap-1">
                                            <RadioGroupItem value="true" id="sle-yes" className="w-5 h-5" />
                                            <Label htmlFor="sle-yes" className="cursor-pointer">Có</Label>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <RadioGroupItem value="false" id="sle-no" className="w-5 h-5" />
                                            <Label htmlFor="sle-no" className="cursor-pointer">Không</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Label>MỤC 13.3. Chất lượng thi công có đảm bảo/không đảm bảo</Label>
                                    <RadioGroup
                                        value={sEval.isConstructionQualityGood ? "true" : "false"}
                                        onValueChange={(v) => setFormData({ supervisorEvaluation: { isConstructionQualityGood: v === "true" } })}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center gap-1">
                                            <RadioGroupItem value="true" id="cqg-yes" className="w-5 h-5" />
                                            <Label htmlFor="cqg-yes" className="cursor-pointer">Đảm bảo</Label>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <RadioGroupItem value="false" id="cqg-no" className="w-5 h-5" />
                                            <Label htmlFor="cqg-no" className="cursor-pointer">Không đảm bảo</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Label>MỤC 13.4. Tình hình công tác an toàn lao động</Label>
                                    <RadioGroup
                                        value={sEval.laborSafetyStatus}
                                        onValueChange={(v) => setFormData({ supervisorEvaluation: { laborSafetyStatus: v as "Tốt" | "Bình thường" | "Kém" } })}
                                        className="flex gap-4"
                                    >
                                        {(["Tốt", "Bình thường", "Kém"] as const).map((v) => (
                                            <div key={v} className="flex items-center gap-1">
                                                <RadioGroupItem value={v} id={`ls-${v}`} className="w-5 h-5" />
                                                <Label htmlFor={`ls-${v}`} className="cursor-pointer">{v}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Label>MỤC 13.5. Tình hình công tác vệ sinh môi trường</Label>
                                    <RadioGroup
                                        value={sEval.environmentalSanitationStatus}
                                        onValueChange={(v) => setFormData({ supervisorEvaluation: { environmentalSanitationStatus: v as "Tốt" | "Bình thường" | "Kém" } })}
                                        className="flex gap-4"
                                    >
                                        {(["Tốt", "Bình thường", "Kém"] as const).map((v) => (
                                            <div key={v} className="flex items-center gap-1">
                                                <RadioGroupItem value={v} id={`es-${v}`} className="w-5 h-5" />
                                                <Label htmlFor={`es-${v}`} className="cursor-pointer">{v}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                                <div className="space-y-1">
                                    <Label>MỤC 13.6. Những đề xuất công việc ngày tới</Label>
                                    <RichTextEditor
                                        value={sEval.nextDayWorkProposals}
                                        onChange={(e) => setFormData({ supervisorEvaluation: { nextDayWorkProposals: e } })}
                                        placeholder="Nhập đề xuất công việc ngày tới..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>MỤC 13.7. Những đề xuất để đảm bảo tiến độ</Label>
                                    <RichTextEditor
                                        value={sEval.progressProposals}
                                        onChange={(e) => setFormData({ supervisorEvaluation: { progressProposals: e } })}
                                        placeholder="Nhập đề xuất để đảm bảo tiến độ..."
                                    />
                                </div>
                            </div>
                            {/* Ghi chú thêm */}
                            <div className="space-y-1">
                                <Label>Ghi chú thêm</Label>
                                <RichTextEditor
                                    value={formData.notes}
                                    onChange={(val) => setFormData({ notes: val })}
                                />
                            </div>

                        </div>
                    </form>

                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    <Button
                        type="submit"
                        form="create-log-form"
                        disabled={isCreating}
                    >
                        <Icon path={isCreating ? mdiLoading : mdiPlus} size={0.8} spin={isCreating} />
                        {isCreating ? "Đang xử lý..." : "Tạo nhật ký"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
