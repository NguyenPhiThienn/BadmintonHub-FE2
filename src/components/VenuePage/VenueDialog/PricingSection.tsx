"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeSlotPicker } from "@/components/ui/time-slot-picker";
import { useCreatePricing, useDeletePricing, useUpdatePricing, useVenuePricing } from "@/hooks/useVenue";
import {
    mdiBankOutline,
    mdiCheckCircleOutline,
    mdiCircleEditOutline,
    mdiClockOutline,
    mdiClose,
    mdiContentSave,
    mdiCurrencyUsd,
    mdiLoading,
    mdiPlus,
    mdiTagOutline,
    mdiTrashCanOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { useState } from "react";
import { toast } from "react-toastify";

const DAY_OF_WEEK_OPTIONS = [
    { value: "__all__", label: "Tất cả các ngày" },
    { value: "1", label: "Thứ Hai" },
    { value: "2", label: "Thứ Ba" },
    { value: "3", label: "Thứ Tư" },
    { value: "4", label: "Thứ Năm" },
    { value: "5", label: "Thứ Sáu" },
    { value: "6", label: "Thứ Bảy" },
    { value: "0", label: "Chủ Nhật" },
];

const LABEL_PRESETS = ["Giờ thấp điểm", "Giờ bình thường", "Giờ cao điểm", "Cuối tuần", "Buổi sáng", "Buổi chiều", "Buổi tối"];

interface PricingSectionProps {
    venueId: string;
    defaultPricePerHour: number;
}

interface PricingFormState {
    startTime: string;
    endTime: string;
    pricePerHour: string;
    label: string;
    dayOfWeek: string;
}

const DEFAULT_FORM: PricingFormState = {
    startTime: "06:00",
    endTime: "17:00",
    pricePerHour: "",
    label: "",
    dayOfWeek: "__all__",
};

function formatPrice(n: number) {
    return new Intl.NumberFormat("vi-VN").format(n) + " đ/giờ";
}

function getDayLabel(dayOfWeek?: number) {
    if (dayOfWeek === undefined || dayOfWeek === null) return "Tất cả các ngày";
    return DAY_OF_WEEK_OPTIONS.find(d => d.value === String(dayOfWeek))?.label ?? "Tất cả các ngày";
}

export const PricingSection = ({ venueId, defaultPricePerHour }: PricingSectionProps) => {
    const { data: pricingRes, isLoading } = useVenuePricing(venueId);
    const pricings: any[] = pricingRes?.data ?? [];

    const createMutation = useCreatePricing();
    const updateMutation = useUpdatePricing();
    const deleteMutation = useDeletePricing();

    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState<PricingFormState>(DEFAULT_FORM);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<PricingFormState>(DEFAULT_FORM);

    const handleAdd = async () => {
        const price = Number(addForm.pricePerHour);
        if (!addForm.startTime || !addForm.endTime) {
            toast.error("Vui lòng nhập đầy đủ khung giờ");
            return;
        }
        if (!price || price <= 0) {
            toast.error("Vui lòng nhập giá hợp lệ");
            return;
        }
        if (addForm.startTime >= addForm.endTime) {
            toast.error("Giờ bắt đầu phải trước giờ kết thúc");
            return;
        }
        try {
            await createMutation.mutateAsync({
                venueId,
                startTime: addForm.startTime,
                endTime: addForm.endTime,
                pricePerHour: price,
                label: addForm.label || undefined,
                dayOfWeek: addForm.dayOfWeek === "__all__" ? undefined : Number(addForm.dayOfWeek),
            });
            toast.success("Thêm khung giá thành công!");
            setAddForm(DEFAULT_FORM);
            setShowAddForm(false);
        } catch (err: any) {
            toast.error(err?.message ?? "Có lỗi xảy ra");
        }
    };

    const startEdit = (p: any) => {
        setEditingId(p._id);
        setEditForm({
            startTime: p.startTime ?? "06:00",
            endTime: p.endTime ?? "17:00",
            pricePerHour: String(p.pricePerHour ?? ""),
            label: p.label ?? "",
            dayOfWeek: p.dayOfWeek !== undefined && p.dayOfWeek !== null ? String(p.dayOfWeek) : "__all__",
        });
    };

    const handleUpdate = async (id: string) => {
        const price = Number(editForm.pricePerHour);
        if (!editForm.startTime || !editForm.endTime) {
            toast.error("Vui lòng nhập đầy đủ khung giờ");
            return;
        }
        if (!price || price <= 0) {
            toast.error("Vui lòng nhập giá hợp lệ");
            return;
        }
        if (editForm.startTime >= editForm.endTime) {
            toast.error("Giờ bắt đầu phải trước giờ kết thúc");
            return;
        }
        try {
            await updateMutation.mutateAsync({
                id,
                venueId,
                data: {
                    startTime: editForm.startTime,
                    endTime: editForm.endTime,
                    pricePerHour: price,
                    label: editForm.label || undefined,
                    dayOfWeek: editForm.dayOfWeek === "__all__" ? undefined : Number(editForm.dayOfWeek),
                },
            });
            toast.success("Cập nhật khung giá thành công!");
            setEditingId(null);
        } catch (err: any) {
            toast.error(err?.message ?? "Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa khung giá này?")) return;
        try {
            await deleteMutation.mutateAsync({ id, venueId });
            toast.success("Đã xóa khung giá");
            if (editingId === id) setEditingId(null);
        } catch (err: any) {
            toast.error(err?.message ?? "Có lỗi xảy ra");
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
                <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-1.5">
                    <Icon path={mdiClockOutline} size={0.8} />
                    Bảng giá theo khung giờ
                </h3>
                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowAddForm(v => !v); setAddForm(DEFAULT_FORM); }}
                >
                    <Icon path={showAddForm ? mdiClose : mdiPlus} size={0.7} />
                    {showAddForm ? "Hủy" : "Thêm khung giá"}
                </Button>
            </div>

            {/* Giá mặc định hint */}
            <div className="flex items-center gap-2 text-xs text-neutral-400 bg-darkBackgroundV1/50 border border-darkBorderV1 rounded-lg px-3 py-2">
                <Icon path={mdiBankOutline} size={0.65} className="text-accent flex-shrink-0" />
                <span>Giá mặc định của cơ sở: <span className="text-white font-semibold">{formatPrice(defaultPricePerHour)}</span> — áp dụng khi không có khung giá nào khớp.</span>
            </div>

            {/* Danh sách khung giá hiện có */}
            {isLoading ? (
                <div className="flex items-center gap-2 py-4 justify-center text-neutral-500 text-sm">
                    <Icon path={mdiLoading} size={0.7} className="animate-spin" />
                    Đang tải bảng giá...
                </div>
            ) : pricings.length === 0 && !showAddForm ? (
                <div className="text-center py-4 text-neutral-500 text-sm italic">
                    Chưa có khung giá riêng. Nhấn "Thêm khung giá" để cấu hình.
                </div>
            ) : (
                <div className="space-y-2">
                    {pricings.map((p) =>
                        editingId === p._id ? (
                            /* EDIT ROW */
                            <PricingFormRow
                                key={p._id}
                                form={editForm}
                                onChange={setEditForm}
                                onSave={() => handleUpdate(p._id)}
                                onCancel={() => setEditingId(null)}
                                isSaving={updateMutation.isPending}
                                mode="edit"
                            />
                        ) : (
                            /* VIEW ROW */
                            <div
                                key={p._id}
                                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-darkBorderV1 bg-darkBackgroundV1/40 hover:border-accent/40 transition-colors group"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="font-mono text-sm font-bold text-white whitespace-nowrap">
                                        {p.startTime} – {p.endTime}
                                    </span>
                                    <span className="text-xs text-neutral-400 whitespace-nowrap hidden sm:block">
                                        {getDayLabel(p.dayOfWeek)}
                                    </span>
                                    {p.label && (
                                        <span className="flex items-center gap-1 text-xs bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                                            <Icon path={mdiTagOutline} size={0.55} />
                                            {p.label}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-accent font-bold text-sm whitespace-nowrap">
                                        {formatPrice(p.pricePerHour)}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-neutral-400 hover:text-accent"
                                            onClick={() => startEdit(p)}
                                            disabled={isPending}
                                        >
                                            <Icon path={mdiCircleEditOutline} size={0.75} />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-neutral-400 hover:text-red-500"
                                            onClick={() => handleDelete(p._id)}
                                            disabled={isPending}
                                        >
                                            <Icon path={mdiTrashCanOutline} size={0.75} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* ADD FORM */}
            {showAddForm && (
                <PricingFormRow
                    form={addForm}
                    onChange={setAddForm}
                    onSave={handleAdd}
                    onCancel={() => setShowAddForm(false)}
                    isSaving={createMutation.isPending}
                    mode="add"
                />
            )}
        </div>
    );
};

/* ---- Sub-component: dùng chung cho Add & Edit ---- */
interface PricingFormRowProps {
    form: PricingFormState;
    onChange: (f: PricingFormState) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    mode: "add" | "edit";
}

function PricingFormRow({ form, onChange, onSave, onCancel, isSaving, mode }: PricingFormRowProps) {
    const set = (key: keyof PricingFormState, val: string) => onChange({ ...form, [key]: val });

    return (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-3">
            <p className="text-xs font-semibold text-accent uppercase tracking-wide flex items-center gap-1.5">
                <Icon path={mode === "add" ? mdiPlus : mdiCircleEditOutline} size={0.65} />
                {mode === "add" ? "Thêm khung giá mới" : "Chỉnh sửa khung giá"}
            </p>

            {/* Row 1: thời gian + giá */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-400">Từ giờ</Label>
                    <TimeSlotPicker value={form.startTime} onChange={v => set("startTime", v)} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-400">Đến giờ</Label>
                    <TimeSlotPicker value={form.endTime} onChange={v => set("endTime", v)} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-400">Giá (đ/giờ) <span className="text-red-400">*</span></Label>
                    <div className="relative">
                        <Input
                            type="number"
                            placeholder="VD: 80000"
                            value={form.pricePerHour}
                            onChange={e => set("pricePerHour", e.target.value)}
                            className="pl-3 bg-darkBackgroundV1/50 text-sm"
                            min={0}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-neutral-400">Áp dụng ngày</Label>
                    <Select value={form.dayOfWeek} onValueChange={v => set("dayOfWeek", v)}>
                        <SelectTrigger className="bg-darkBackgroundV1/50 text-sm">
                            <SelectValue placeholder="Tất cả các ngày" />
                        </SelectTrigger>
                        <SelectContent>
                            {DAY_OF_WEEK_OPTIONS.map(d => (
                                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Row 2: label */}
            <div className="space-y-1">
                <Label className="text-xs text-neutral-400">Nhãn hiển thị (tùy chọn)</Label>
                <div className="flex gap-2 flex-wrap">
                    {LABEL_PRESETS.map(preset => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => set("label", form.label === preset ? "" : preset)}
                            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${form.label === preset
                                    ? "border-accent bg-accent/20 text-accent"
                                    : "border-darkBorderV1 text-neutral-400 hover:border-accent/50 hover:text-neutral-200"
                                }`}
                        >
                            <Icon path={mdiTagOutline} size={0.5} />
                            {preset}
                        </button>
                    ))}
                    <Input
                        placeholder="Hoặc nhập nhãn tùy chỉnh..."
                        value={LABEL_PRESETS.includes(form.label) ? "" : form.label}
                        onChange={e => set("label", e.target.value)}
                        className="flex-1 min-w-[160px] h-7 text-xs bg-darkBackgroundV1/50"
                    />
                </div>
            </div>

            {/* Preview */}
            {form.startTime && form.endTime && form.pricePerHour && (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                    <Icon path={mdiCheckCircleOutline} size={0.65} />
                    <span>
                        Khung <span className="font-mono font-bold">{form.startTime}–{form.endTime}</span>
                        {form.dayOfWeek !== "__all__" && <> · {DAY_OF_WEEK_OPTIONS.find(d => d.value === form.dayOfWeek)?.label}</>}
                        {" · "}
                        <span className="font-bold">{new Intl.NumberFormat("vi-VN").format(Number(form.pricePerHour))} đ/giờ</span>
                        {form.label && <> · "{form.label}"</>}
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
                    <Icon path={mdiClose} size={0.7} />
                    Hủy
                </Button>
                <Button type="button" size="sm" onClick={onSave} disabled={isSaving}>
                    {isSaving
                        ? <Icon path={mdiLoading} size={0.7} className="animate-spin" />
                        : <Icon path={mode === "add" ? mdiPlus : mdiContentSave} size={0.7} />
                    }
                    {mode === "add" ? "Thêm" : "Lưu thay đổi"}
                </Button>
            </div>
        </div>
    );
}
