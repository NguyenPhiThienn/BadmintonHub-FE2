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
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import { IVenue } from "@/interface/venue";
import {
    mdiClose,
    mdiContentSave,
    mdiCurrencyUsd,
    mdiLoading,
    mdiMapMarkerOutline,
    mdiPlus,
    mdiStoreOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

interface VenueDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData: IVenue | null;
    mode: "create" | "edit";
    isSubmitting?: boolean;
}

export const VenueDialog = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode,
    isSubmitting = false,
}: VenueDialogProps) => {
    const form = useForm({
        defaultValues: {
            name: "",
            address: "",
            description: "",
            openTime: "06:00",
            closeTime: "22:00",
            pricePerHour: 0,
            courts: [{ name: "Sân số 1", type: "Sàn gỗ", status: "AVAILABLE" }],
            images: [{ imageUrl: "", isPrimary: true }],
        },
    });

    const { fields: courtFields, append: appendCourt, remove: removeCourt } = useFieldArray({
        control: form.control,
        name: "courts",
    });

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control: form.control,
        name: "images",
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData && mode === "edit") {
                form.reset({
                    name: initialData.name || "",
                    address: initialData.address || "",
                    description: initialData.description || "",
                    openTime: initialData.openTime || "06:00",
                    closeTime: initialData.closeTime || "22:00",
                    pricePerHour: initialData.pricePerHour || 0,
                    courts: (initialData.courts as any) || [{ name: "Sân số 1", type: "Sàn gỗ", status: "AVAILABLE" }],
                    images: (initialData.images as any) || [{ imageUrl: "", isPrimary: true }],
                });
            } else {
                form.reset({
                    name: "",
                    address: "",
                    description: "",
                    openTime: "06:00",
                    closeTime: "22:00",
                    pricePerHour: 0,
                    courts: [{ name: "Sân số 1", type: "Sàn gỗ", status: "AVAILABLE" }],
                    images: [{ imageUrl: "", isPrimary: true }],
                });
            }
        }
    }, [initialData, mode, form, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mode === "create" ? mdiPlus : mdiStoreOutline} size={0.8} />
                        <span>{mode === "create" ? "Tạo cơ sở sân mới" : `Cập nhật cơ sở: ${initialData?.name}`}</span>
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">

                            {/* SECTION: THÔNG TIN CƠ BẢN */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    rules={{ required: "Tên cơ sở không được để trống" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tên cơ sở sân</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập tên cơ sở..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    rules={{ required: "Địa chỉ không được để trống" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Địa chỉ</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input className="pl-9" placeholder="Nhập địa chỉ chi tiết..." {...field} />
                                                    <Icon path={mdiMapMarkerOutline} size={0.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="col-span-1 md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mô tả chi tiết</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Nhập mô tả về cơ sở sân..."
                                                        className="min-h-[100px] resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* SECTION: THÔNG TIN HOẠT ĐỘNG */}
                            <div className="flex items-center gap-3 md:gap-4 mt-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin hoạt động</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="openTime"
                                        rules={{ required: "Vui lòng chọn giờ mở cửa" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Giờ mở cửa</FormLabel>
                                                <FormControl>
                                                    <TimePicker value={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="closeTime"
                                        rules={{ required: "Vui lòng chọn giờ đóng cửa" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Giờ đóng cửa</FormLabel>
                                                <FormControl>
                                                    <TimePicker value={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="pricePerHour"
                                    rules={{
                                        required: "Vui lòng nhập giá thuê",
                                        min: { value: 0, message: "Giá thuê không được âm" }
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá thuê mặc định (đ/giờ)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input type="number" className="pl-9" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                    <Icon path={mdiCurrencyUsd} size={0.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex items-center gap-3 md:gap-4 mt-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Danh sách sân con ({courtFields.length})</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => appendCourt({ name: `Sân số ${courtFields.length + 1}`, type: "Sàn gỗ", status: "AVAILABLE" })}
                                >
                                    <Icon path={mdiPlus} size={0.8} />
                                    Thêm sân
                                </Button>
                            </div>

                            <div className="flex flex-col gap-4 mb-4">
                                {courtFields.map((field, index) => (
                                    <div key={field.id} className="relative p-4 rounded-lg border border-neutral-900 bg-black">
                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            <FormField
                                                control={form.control}
                                                name={`courts.${index}.name`}
                                                rules={{ required: "Tên sân không được để trống" }}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tên sân</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Sân số..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex flex-1 items-end gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`courts.${index}.type`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormLabel>Loại sàn</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => removeCourt(index)}
                                                >
                                                    <Icon path={mdiTrashCanOutline} size={0.8} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 md:gap-4 mt-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Hình ảnh cơ sở ({imageFields.length})</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => appendImage({ imageUrl: "", isPrimary: false })}
                                >
                                    <Icon path={mdiPlus} size={0.8} />
                                    Thêm ảnh
                                </Button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {imageFields.map((field, index) => (
                                    <div key={field.id} className="relative p-4 rounded-lg border border-neutral-900 bg-black">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`images.${index}.imageUrl`}
                                                rules={{ required: "URL hình ảnh không được để trống" }}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>URL hình ảnh</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex items-end gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`images.${index}.isPrimary`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center gap-2 space-y-0 pb-2">
                                                            <FormControl>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={field.value}
                                                                    onChange={field.onChange}
                                                                    className="w-4 h-4 rounded border-neutral-700 bg-black text-accent focus:ring-accent"
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-xs text-neutral-400">Ảnh chính</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <Icon path={mdiTrashCanOutline} size={0.8} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                                <Icon path={mdiClose} size={0.8} />
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                                ) : (
                                    <Icon path={mode === "create" ? mdiPlus : mdiContentSave} size={0.8} />
                                )}
                                {mode === "create" ? "Tạo cơ sở" : "Lưu thay đổi"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
