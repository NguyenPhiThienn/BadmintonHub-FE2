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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import { useCreateManualBooking } from "@/hooks/useBooking";
import { useVenueDetails } from "@/hooks/useVenue";
import { IManualBookingRequest } from "@/interface/booking";
import { ICourt, IVenue } from "@/interface/venue";
import {
    mdiAccountOutline,
    mdiCalendarClock,
    mdiCalendarPlus,
    mdiLoading,
    mdiLockOutline,
    mdiNoteOutline,
    mdiStoreOutline
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
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={bookingType === "BOOKING" ? mdiCalendarPlus : mdiLockOutline} size={0.8} />
                        <span>{bookingType === "BOOKING" ? "Đặt sân thủ công" : "Khóa sân tạm thời"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 bg-darkCardV1/30 border-b border-darkBorderV1">
                    <Tabs value={bookingType} onValueChange={(v) => setBookingType(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-darkBackgroundV1 border border-darkBorderV1">
                            <TabsTrigger value="BOOKING" className="gap-2">
                                <Icon path={mdiCalendarPlus} size={0.6} />
                                Đơn đặt sân
                            </TabsTrigger>
                            <TabsTrigger value="LOCK" className="gap-2">
                                <Icon path={mdiLockOutline} size={0.6} />
                                Khóa sân
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <Form {...form}>
                    <form id="manual-booking-form" onSubmit={form.handleSubmit(onSubmit)} className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3 md:p-4 space-y-6">
                        {/* Section: Cơ sở & Sân */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-2">
                                    <Icon path={mdiStoreOutline} size={0.8} />
                                    Địa điểm & Sân
                                </h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

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
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-2">
                                    <Icon path={mdiCalendarClock} size={0.8} />
                                    Thời gian
                                </h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

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

                        {/* Section: Khách hàng (Chỉ hiện khi là BOOKING) */}
                        {bookingType === "BOOKING" && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-2">
                                        <Icon path={mdiAccountOutline} size={0.8} />
                                        Thông tin khách hàng
                                    </h3>
                                    <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="customerName"
                                        rules={{ required: bookingType === "BOOKING" ? "Tên khách là bắt buộc" : false }}
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
                        )}

                        {/* Section: Ghi chú */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap flex items-center gap-2">
                                    <Icon path={mdiNoteOutline} size={0.8} />
                                    Ghi chú thêm
                                </h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

                            <FormField
                                control={form.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                rows={4}
                                                placeholder={bookingType === "BOOKING" ? "Yêu cầu đặc biệt của khách..." : "Lý do khóa sân bảo trì..."}
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
                        Đóng
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        form="manual-booking-form"
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                                <span>Đang xử lý...</span>
                            </div>
                        ) : (
                            <span>Xác nhận thực hiện</span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
