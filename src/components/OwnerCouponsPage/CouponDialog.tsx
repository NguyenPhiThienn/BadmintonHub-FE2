"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyVenues } from "@/hooks/useVenue";
import { ICoupon, CouponDiscountType, CouponStatus } from "@/types/coupon";
import {
    mdiClose,
    mdiContentSave,
    mdiLoading,
    mdiPlus,
    mdiTagOutline,
    mdiInformationOutline,
    mdiCashMultiple,
    mdiCalendarClock
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface CouponDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData: ICoupon | null;
    mode: "create" | "edit";
    isSubmitting?: boolean;
}

export const CouponDialog = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode,
    isSubmitting = false,
}: CouponDialogProps) => {
    const { data: venuesRes } = useMyVenues({ limit: 100 });
    const venues = venuesRes?.data?.venues || [];

    const form = useForm({
        defaultValues: {
            code: "",
            venueId: "all",
            discountType: CouponDiscountType.PERCENTAGE,
            discountValue: 0,
            minOrderValue: 0,
            maxDiscountAmount: 0,
            startDate: new Date().toISOString().slice(0, 16),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            usageLimit: 100,
            status: CouponStatus.ACTIVE,
        },
    });

    const isUsed = mode === "edit" && initialData ? initialData.usedCount > 0 : false;

    useEffect(() => {
        if (isOpen) {
            if (initialData && mode === "edit") {
                const sDate = new Date(initialData.startDate);
                const eDate = new Date(initialData.endDate);
                
                // Cần format lại timezone cho type="datetime-local" (YYYY-MM-DDThh:mm)
                const formatForInput = (d: Date) => {
                    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
                    return local.toISOString().slice(0, 16);
                };

                form.reset({
                    code: initialData.code || "",
                    venueId: initialData.venueId || "all",
                    discountType: initialData.discountType || CouponDiscountType.PERCENTAGE,
                    discountValue: initialData.discountValue || 0,
                    minOrderValue: initialData.minOrderValue || 0,
                    maxDiscountAmount: initialData.maxDiscountAmount || 0,
                    startDate: formatForInput(sDate),
                    endDate: formatForInput(eDate),
                    usageLimit: initialData.usageLimit || 100,
                    status: initialData.status || CouponStatus.ACTIVE,
                });
            } else {
                const now = new Date();
                const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                const formatForInput = (d: Date) => {
                    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
                    return local.toISOString().slice(0, 16);
                };

                form.reset({
                    code: "",
                    venueId: "all",
                    discountType: CouponDiscountType.PERCENTAGE,
                    discountValue: 0,
                    minOrderValue: 0,
                    maxDiscountAmount: 0,
                    startDate: formatForInput(now),
                    endDate: formatForInput(nextWeek),
                    usageLimit: 100,
                    status: CouponStatus.ACTIVE,
                });
            }
        }
    }, [initialData, mode, form, isOpen]);

    const discountType = form.watch("discountType");

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mode === "create" ? mdiPlus : mdiTagOutline} size={0.8} />
                        <span>{mode === "create" ? "Tạo mã khuyến mãi mới" : `Cập nhật mã: ${initialData?.code}`}</span>
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                            
                            {isUsed && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
                                    Mã này đã có người sử dụng ({initialData?.usedCount} lượt). Bạn chỉ có thể sửa ngày hết hạn, số lượng và trạng thái.
                                </div>
                            )}

                            {/* SECTION: THÔNG TIN CƠ BẢN */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-1.5 text-sm uppercase tracking-wide">
                                        <Icon path={mdiInformationOutline} size={0.7} />
                                        Thông tin cơ bản
                                    </h3>
                                    <div className="flex-1 border-b border-dashed border-accent/50 mr-1" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        rules={{ required: "Mã không được để trống" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mã khuyến mãi (Code)</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="VD: SALE20" 
                                                        {...field} 
                                                        className="uppercase font-bold text-accent tracking-widest bg-darkBackgroundV1/50" 
                                                        onChange={e => field.onChange(e.target.value.toUpperCase())} 
                                                        disabled={isUsed}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="venueId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Áp dụng cho sân</FormLabel>
                                                <Select value={field.value} onValueChange={field.onChange} disabled={isUsed}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-darkBackgroundV1/50">
                                                            <SelectValue placeholder="Chọn sân áp dụng" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="all">Tất cả các sân của tôi</SelectItem>
                                                        {venues.map(v => (
                                                            <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* SECTION: THIẾT LẬP GIẢM GIÁ */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-1.5 text-sm uppercase tracking-wide">
                                        <Icon path={mdiCashMultiple} size={0.7} />
                                        Thiết lập giảm giá
                                    </h3>
                                    <div className="flex-1 border-b border-dashed border-accent/50 mr-1" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="discountType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Loại giảm giá</FormLabel>
                                                <Select value={field.value} onValueChange={field.onChange} disabled={isUsed}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-darkBackgroundV1/50">
                                                            <SelectValue placeholder="Chọn loại giảm" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={CouponDiscountType.PERCENTAGE}>Giảm theo %</SelectItem>
                                                        <SelectItem value={CouponDiscountType.FIXED_AMOUNT}>Trừ tiền mặt</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="discountValue"
                                        rules={{ 
                                            required: "Vui lòng nhập giá trị giảm",
                                            min: { value: 1, message: "Giá trị phải lớn hơn 0" },
                                            max: discountType === CouponDiscountType.PERCENTAGE ? { value: 100, message: "Không quá 100%" } : undefined
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Mức giảm {discountType === CouponDiscountType.PERCENTAGE ? "(%)" : "(VNĐ)"}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        {...field} 
                                                        value={field.value === 0 ? "" : field.value.toString()}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            field.onChange(val === "" ? 0 : Number(val));
                                                        }}
                                                        disabled={isUsed}
                                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                        className="bg-darkBackgroundV1/50"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="minOrderValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Đơn tối thiểu (VNĐ) - Tùy chọn</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        {...field} 
                                                        value={field.value === 0 ? "" : field.value.toString()}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            field.onChange(val === "" ? 0 : Number(val));
                                                        }}
                                                        disabled={isUsed}
                                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                        className="bg-darkBackgroundV1/50"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {discountType === CouponDiscountType.PERCENTAGE && (
                                        <FormField
                                            control={form.control}
                                            name="maxDiscountAmount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Giảm tối đa (VNĐ) - Tùy chọn</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number" 
                                                            {...field} 
                                                            value={field.value === 0 ? "" : field.value.toString()}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                field.onChange(val === "" ? 0 : Number(val));
                                                            }}
                                                            disabled={isUsed}
                                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                            className="bg-darkBackgroundV1/50"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* SECTION: THỜI GIAN & GIỚI HẠN */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-1.5 text-sm uppercase tracking-wide">
                                        <Icon path={mdiCalendarClock} size={0.7} />
                                        Thời gian & Giới hạn
                                    </h3>
                                    <div className="flex-1 border-b border-dashed border-accent/50 mr-1" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        rules={{ required: "Vui lòng chọn ngày bắt đầu" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bắt đầu từ</FormLabel>
                                                <FormControl>
                                                    <Input type="datetime-local" {...field} disabled={isUsed} className="bg-darkBackgroundV1/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        rules={{ required: "Vui lòng chọn ngày kết thúc" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Đến hết ngày</FormLabel>
                                                <FormControl>
                                                    <Input type="datetime-local" {...field} className="bg-darkBackgroundV1/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="usageLimit"
                                        rules={{ min: { value: 1, message: "Phải lớn hơn 0" } }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số lượt giới hạn</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        {...field} 
                                                        value={field.value === 0 ? "" : field.value.toString()}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            field.onChange(val === "" ? 0 : Number(val));
                                                        }}
                                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                        className="bg-darkBackgroundV1/50"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {mode === "edit" && (
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Trạng thái</FormLabel>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-darkBackgroundV1/50">
                                                                <SelectValue placeholder="Chọn trạng thái" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value={CouponStatus.ACTIVE}>Hoạt động</SelectItem>
                                                            <SelectItem value={CouponStatus.INACTIVE}>Tạm ngưng</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            </div>

                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                <Icon path={mdiClose} size={0.8} />
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                                ) : (
                                    <Icon path={mode === "create" ? mdiPlus : mdiContentSave} size={0.8} />
                                )}
                                {mode === "create" ? "Tạo mã" : "Lưu thay đổi"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
