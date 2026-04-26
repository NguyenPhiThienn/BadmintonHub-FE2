"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useBookingDetails } from "@/hooks/useBooking";
import { IBooking, BookingStatus } from "@/interface/booking";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiCalendarCheck,
    mdiCalendarClock,
    mdiClose,
    mdiCurrencyUsd,
    mdiMapMarkerOutline,
    mdiPhone,
    mdiEmail,
    mdiAccountOutline,
    mdiClockOutline,
    mdiInformationOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";

interface BookingDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    booking: IBooking | null;
}

const statusVariantMap: Record<BookingStatus, "green" | "blue" | "red" | "neutral" | "orange" | "yellow"> = {
    PENDING: "yellow",
    CONFIRMED: "blue",
    COMPLETED: "green",
    CANCELLED: "red",
};

const statusLabelMap: Record<BookingStatus, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã huỷ",
};

export const BookingDetailsDialog = ({
    isOpen,
    onClose,
    booking,
}: BookingDetailsDialogProps) => {
    const { data: detailRes, isLoading } = useBookingDetails(booking?._id ?? "");
    const bookingData: IBooking | undefined = detailRes?.data ?? booking ?? undefined;

    const player = typeof bookingData?.playerId === 'object' ? bookingData.playerId : null;
    const venue = typeof bookingData?.venueId === 'object' ? bookingData.venueId : null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiCalendarCheck} size={0.8} className="flex-shrink-0" />
                        <span>Chi tiết đơn đặt sân</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <Skeleton className="h-6 w-32" />
                                    <div className="flex-1 border-b border-dashed border-accent/20" />
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            {[...Array(3)].map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="w-[160px]"><Skeleton className="h-5 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                                    <TableCell className="w-[160px]"><Skeleton className="h-5 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Thông tin người đặt */}
                            <div className="flex items-center gap-3 md:gap-4 mb-2">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin người đặt</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiAccountOutline} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Họ tên</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{player?.fullName || "—"}</Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiEmail} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Email</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{player?.email || "—"}</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiPhone} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Số điện thoại</span>
                                                </div>
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                                <Badge variant="neutral">{player?.phone || "—"}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Thông tin cơ sở */}
                            <div className="flex items-center gap-3 md:gap-4 mt-4 mb-2">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin cơ sở</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiMapMarkerOutline} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Tên cơ sở</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{venue?.name || "—"}</Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiInformationOutline} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Trạng thái</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={bookingData?.status ? statusVariantMap[bookingData.status] : "neutral"}>
                                                    {bookingData?.status ? statusLabelMap[bookingData.status] : "—"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiMapMarkerOutline} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Địa chỉ</span>
                                                </div>
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                                <Badge variant="neutral">{venue?.address || "—"}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Thông tin thanh toán */}
                            <div className="flex items-center gap-3 md:gap-4 mt-4 mb-2">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin thanh toán</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiCurrencyUsd} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Tổng tiền</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="green">
                                                    {bookingData?.totalPrice?.toLocaleString()} đ
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiCalendarClock} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Ngày tạo</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">
                                                    {bookingData?.createdAt ? formatDateWithTime(bookingData.createdAt) : "—"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Chi tiết lịch đặt */}
                            {bookingData?.details && bookingData.details.length > 0 && (
                                <>
                                    <div className="flex items-center gap-3 md:gap-4 mt-4 mb-2">
                                        <h3 className="text-accent font-semibold whitespace-nowrap">Chi tiết lịch đặt</h3>
                                        <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                    </div>
                                    <div className="space-y-2">
                                        {bookingData.details.map((detail, i) => {
                                            const court = typeof detail.courtId === 'object' ? detail.courtId : null;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <Card className="p-3 border border-darkBorderV1 bg-darkCardV1/30">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <Icon path={mdiCalendarClock} size={0.6} className="text-accent" />
                                                                <span className="text-neutral-400 text-sm font-medium">Ngày:</span>
                                                                <Badge variant="neutral">{detail.bookingDate}</Badge>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Icon path={mdiClockOutline} size={0.6} className="text-accent" />
                                                                <span className="text-neutral-400 text-sm font-medium">Giờ:</span>
                                                                <Badge variant="neutral">{detail.startTime} – {detail.endTime}</Badge>
                                                            </div>
                                                            {court?.name && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-neutral-400 text-sm font-medium">Sân:</span>
                                                                    <Badge variant="blue">{court.name}</Badge>
                                                                </div>
                                                            )}
                                                            {detail.price != null && (
                                                                <div className="flex items-center gap-1.5 ml-auto">
                                                                    <Badge variant="green">{detail.price?.toLocaleString()} đ</Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter className="flex-row justify-end gap-3 mt-4">
                    <Button variant="ghost" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
