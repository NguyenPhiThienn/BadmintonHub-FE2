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
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import { useCreateManualBooking, useCreatePaymentUrl } from "@/hooks/useBooking";
import { useVenueDetails, useVenuePricing } from "@/hooks/useVenue";
import { IManualBookingRequest } from "@/interface/booking";
import { ICourt, IVenue } from "@/interface/venue";
import {
    mdiCalendarPlus,
    mdiCheck,
    mdiClose,
    mdiLoading
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface ManualBookingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    venues: IVenue[];
}

interface IFormManualBookingRequest extends IManualBookingRequest {
    paymentMethod: "CASH" | "VNPAY";
}

export const ManualBookingDialog = ({
    isOpen,
    onClose,
    venues,
}: ManualBookingDialogProps) => {
    const [selectedVenueId, setSelectedVenueId] = useState<string>("");

    const { data: venueDetailsRes } = useVenueDetails(selectedVenueId);
    const courts = venueDetailsRes?.data?.courts || [];

    const form = useForm<IFormManualBookingRequest>({
        defaultValues: {
            type: "BOOKING",
            venueId: "",
            courtId: "",
            bookingDate: (() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, "0");
                const day = String(now.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            })(),
            startTime: "08:00",
            endTime: "09:00",
            customerName: "",
            customerPhone: "",
            note: "",
            paymentMethod: "CASH",
        },
    });

    const venueId = form.watch("venueId");
    const courtId = form.watch("courtId");
    const bookingDate = form.watch("bookingDate");
    const startTime = form.watch("startTime");
    const endTime = form.watch("endTime");

    const { data: pricingRes } = useVenuePricing(venueId);
    const pricings = pricingRes?.data || [];

    const calculatePrice = () => {
        if (!venueId || !courtId || !bookingDate || !startTime || !endTime) return 0;

        const venue = venues.find((v) => v._id === venueId);
        if (!venue) return 0;

        // Calculate duration in hours
        const [startH, startM] = startTime.split(":").map(Number);
        const [endH, endM] = endTime.split(":").map(Number);
        const startTotal = startH + startM / 60;
        const endTotal = endH + endM / 60;
        const duration = endTotal - startTotal;
        if (duration <= 0) return 0;

        // Determine day of week (Monday = 0, Tuesday = 1, ..., Sunday = 6)
        const dateObj = new Date(bookingDate);
        let dayOfWeek = dateObj.getDay() - 1;
        if (dayOfWeek === -1) dayOfWeek = 6; // Sunday

        // Find matching pricing rule
        const matchingRule =
            pricings.find((p: any) => {
                const dayMatches = p.dayOfWeek === dayOfWeek;
                const timeMatches = p.startTime <= startTime && p.endTime >= endTime;
                return dayMatches && timeMatches;
            }) ||
            pricings.find((p: any) => {
                const isFallback = p.dayOfWeek === null || p.dayOfWeek === undefined;
                const timeMatches = p.startTime <= startTime && p.endTime >= endTime;
                return isFallback && timeMatches;
            });

        const rate = matchingRule ? matchingRule.pricePerHour : venue.pricePerHour;
        return Math.round(duration * rate);
    };

    const calculatedPrice = calculatePrice();

    const { mutate: createManual, isPending: isBookingPending } = useCreateManualBooking();
    const { mutate: createPaymentUrl, isPending: isPaymentPending } = useCreatePaymentUrl();

    const isPending = isBookingPending || isPaymentPending;

    useEffect(() => {
        if (!isOpen) {
            form.reset();
            setSelectedVenueId("");
        }
    }, [isOpen, form]);

    const onSubmit = (data: IFormManualBookingRequest) => {
        const payload = {
            ...data,
            type: "BOOKING" as const,
        };

        createManual(payload, {
            onSuccess: (res: any) => {
                toast.success("Tạo đơn đặt sân thành công");
                const bookingId = res?.data?._id;

                if ((data.paymentMethod === "VNPAY") && bookingId) {
                    toast.info("Đang kết nối đến cổng thanh toán...");
                    createPaymentUrl({ bookingId, method: data.paymentMethod }, {
                        onSuccess: (paymentRes: any) => {
                            if (paymentRes?.data?.paymentUrl) {
                                window.location.href = paymentRes.data.paymentUrl;
                            } else {
                                toast.error("Không tạo được liên kết thanh toán");
                                onClose();
                            }
                        },
                        onError: () => {
                            toast.error("Không thể kết nối cổng thanh toán");
                            onClose();
                        }
                    });
                } else {
                    onClose();
                }
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Thao tác thất bại");
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiCalendarPlus} size={0.8} />
                        <span>Đặt sân thủ công</span>
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form id="manual-booking-form" onSubmit={form.handleSubmit(onSubmit)} className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3 md:p-4 space-y-4">
                        {/* Section: Cơ sở & Sân */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="venueId"
                                    rules={{ required: "Vui lòng chọn cơ sở" }}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="uppercase text-xs font-bold flex items-center gap-1 h-5">
                                                Cơ sở
                                            </FormLabel>
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
                                                <SelectContent className="bg-darkCardV1 border-darkBorderV1">
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
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="uppercase text-xs font-bold flex items-center gap-1 h-5">
                                                Sân con
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedVenueId}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={selectedVenueId ? "Chọn sân" : "Chọn cơ sở trước"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-darkCardV1 border-darkBorderV1">
                                                    {courts.map((c: ICourt) => (
                                                        <SelectItem key={c._id} value={c._id}>{c.name} - {c.type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Section: Thời gian */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="bookingDate"
                                    rules={{ required: "Vui lòng chọn ngày" }}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="uppercase text-xs font-bold flex items-center gap-1 h-5">
                                                Ngày đặt
                                            </FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value ? new Date(field.value) : undefined}
                                                    onDateChange={(date) => {
                                                        if (date) {
                                                            const year = date.getFullYear();
                                                            const month = String(date.getMonth() + 1).padStart(2, "0");
                                                            const day = String(date.getDate()).padStart(2, "0");
                                                            field.onChange(`${year}-${month}-${day}`);
                                                        } else {
                                                            field.onChange("");
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="startTime"
                                    rules={{ required: "Giờ bắt đầu" }}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="uppercase text-xs font-bold flex items-center gap-1 h-5">
                                                Giờ bắt đầu
                                            </FormLabel>
                                            <FormControl>
                                                <TimePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endTime"
                                    rules={{ required: "Giờ kết thúc" }}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="uppercase text-xs font-bold flex items-center gap-1 h-5">
                                                Giờ kết thúc
                                            </FormLabel>
                                            <FormControl>
                                                <TimePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Section: Khách hàng */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="customerName"
                                    rules={{ required: "Tên khách là bắt buộc" }}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="uppercase text-xs font-bold flex items-center gap-1 h-5">
                                                Tên khách hàng
                                            </FormLabel>
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
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="uppercase text-xs font-bold flex items-center gap-1 h-5">
                                                Số điện thoại
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="09xx xxx xxx" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Section: Thanh toán */}
                        <div className="space-y-4 border-t border-darkBorderV1 pt-4">
                            <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">Thông tin thanh toán</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="paymentMethod"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="uppercase text-xs font-bold flex items-center gap-1 h-5">
                                                Phương thức thanh toán
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn phương thức" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-darkCardV1 border-darkBorderV1">
                                                    <SelectItem value="CASH">💵 Tiền mặt (Tại sân)</SelectItem>
                                                    <SelectItem value="VNPAY">💳 Chuyển khoản qua VNPay</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-col justify-end">
                                    <div className="bg-darkBorderV1/40 border border-darkBorderV1 rounded-lg p-3 flex justify-between items-center h-[42px] mt-auto">
                                        <span className="text-xs font-semibold text-neutral-400 uppercase">Tổng tiền:</span>
                                        <span className="text-lg font-bold text-green-400">
                                            {calculatedPrice.toLocaleString("vi-VN")} đ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Ghi chú */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                rows={4}
                                                placeholder="Yêu cầu đặc biệt của khách..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        form="manual-booking-form"
                    >
                        {isPending ? (
                            <>
                                <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                <Icon path={mdiCheck} size={0.8} />
                                <span>Xác nhận thực hiện</span>
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
