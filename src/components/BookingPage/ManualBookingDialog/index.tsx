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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCreateManualBooking } from "@/hooks/useBooking";
import { useVenueDetails } from "@/hooks/useVenue";
import { IManualBookingRequest } from "@/interface/booking";
import { ICourt, IVenue } from "@/interface/venue";
import { mdiCalendarPlus, mdiLoading, mdiLockOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface ManualBookingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    venues: IVenue[];
}

export const ManualBookingDialog = ({
    isOpen,
    onClose,
    venues,
}: ManualBookingDialogProps) => {
    const [bookingType, setBookingType] = useState<"BOOKING" | "LOCK">("BOOKING");
    const [selectedVenueId, setSelectedVenueId] = useState<string>("");

    const { data: venueDetailsRes } = useVenueDetails(selectedVenueId);
    const courts = venueDetailsRes?.data?.courts || [];

    const form = useForm<IManualBookingRequest>({
        defaultValues: {
            type: "BOOKING",
            venueId: "",
            courtId: "",
            bookingDate: new Date().toISOString().split("T")[0],
            startTime: "08:00",
            endTime: "09:00",
            customerName: "",
            customerPhone: "",
            note: "",
        },
    });

    const { mutate: createManual, isPending } = useCreateManualBooking();

    useEffect(() => {
        if (!isOpen) {
            form.reset();
            setSelectedVenueId("");
            setBookingType("BOOKING");
        }
    }, [isOpen, form]);

    const onSubmit = (data: IManualBookingRequest) => {
        const payload = {
            ...data,
            type: bookingType,
        };

        createManual(payload, {
            onSuccess: () => {
                toast.success(bookingType === "BOOKING" ? "Tạo đơn đặt sân thành công" : "Đã khóa sân thành công");
                onClose();
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Thao tác thất bại");
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-secondary">
                        <Icon path={bookingType === "BOOKING" ? mdiCalendarPlus : mdiLockOutline} size={0.8} />
                        <span>{bookingType === "BOOKING" ? "Đặt sân thủ công" : "Khóa sân tạm thời"}</span>
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={bookingType} onValueChange={(v) => setBookingType(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-darkBackgroundV1 border border-darkBorderV1">
                        <TabsTrigger value="BOOKING">Đơn đặt sân</TabsTrigger>
                        <TabsTrigger value="LOCK">Khóa sân</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="venueId"
                                rules={{ required: "Vui lòng chọn cơ sở" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cơ sở</FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                setSelectedVenueId(val);
                                            }}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn cơ sở" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {venues.map((v) => (
                                                    <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="courtId"
                                rules={{ required: "Vui lòng chọn sân" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sân con</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedVenueId}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={selectedVenueId ? "Chọn sân" : "Vui lòng chọn cơ sở trước"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {courts.map((c: ICourt) => (
                                                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="bookingDate"
                                rules={{ required: "Vui lòng chọn ngày" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày đặt</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="startTime"
                                rules={{ required: "Chọn giờ bắt đầu" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giờ bắt đầu</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endTime"
                                rules={{ required: "Chọn giờ kết thúc" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giờ kết thúc</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {bookingType === "BOOKING" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-accent/5 border border-dashed border-accent/30">
                                <FormField
                                    control={form.control}
                                    name="customerName"
                                    rules={{ required: bookingType === "BOOKING" ? "Vui lòng nhập tên khách" : false }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tên khách hàng</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập tên khách..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="customerPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số điện thoại (Tùy chọn)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập SĐT..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ghi chú</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={bookingType === "BOOKING" ? "Ghi chú về đơn đặt..." : "Lý do khóa sân..."}
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isPending} className="min-w-[120px]">
                                {isPending ? <Icon path={mdiLoading} size={0.8} className="animate-spin" /> : "Xác nhận"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
