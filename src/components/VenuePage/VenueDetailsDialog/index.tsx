"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useVenueDetails } from "@/hooks/useVenue";
import { IVenue } from "@/interface/venue";
import {
    mdiAccount,
    mdiClockOutline,
    mdiClose,
    mdiCurrencyUsd,
    mdiEmail,
    mdiInformationOutline,
    mdiMapMarkerOutline,
    mdiPhone,
    mdiPlaylistRemove,
    mdiStarOutline,
    mdiStoreOutline
} from "@mdi/js";
import Icon from "@mdi/react";

interface VenueDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    venue: IVenue | null;
}

export const VenueDetailsDialog = ({
    isOpen,
    onClose,
    venue,
}: VenueDetailsDialogProps) => {
    const venueId = venue?._id || "";
    const { data: venueDetailsResponse, isLoading: isDetailsLoading } = useVenueDetails(venueId);

    const venueData = venueDetailsResponse?.data || venue;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-secondary">
                        <Icon path={mdiStoreOutline} size={0.8} />
                        <span>Chi tiết cơ sở sân: {venueData?.name}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    {isDetailsLoading ? (
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
                            {/* Section: Basic Info */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-secondary font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiStoreOutline} size={0.6} />
                                                    <span className="text-nowrap">Tên cơ sở</span>
                                                </div>
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                                <Badge variant="neutral">{venueData?.name}</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiMapMarkerOutline} size={0.6} />
                                                    <span className="text-nowrap">Địa chỉ</span>
                                                </div>
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                                <Badge variant="neutral">{venueData?.address}</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiInformationOutline} size={0.6} />
                                                    <span className="text-nowrap">Mô tả</span>
                                                </div>
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                                <div className="text-neutral-400 text-sm italic leading-relaxed py-1">
                                                    {venueData?.description || "Không có mô tả cho cơ sở này."}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiClockOutline} size={0.6} />
                                                    <span className="text-nowrap">Giờ hoạt động</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{venueData?.openTime} - {venueData?.closeTime}</Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiCurrencyUsd} size={0.6} />
                                                    <span className="text-nowrap">Giá thuê</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="green">
                                                    {venueData?.pricePerHour?.toLocaleString()} đ / giờ
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiAccount} size={0.6} />
                                                    <span className="text-nowrap">Chủ sở hữu</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="green">
                                                    {typeof venueData?.ownerId === 'object' ? venueData?.ownerId?.fullName : venueData?.ownerId || "N/A"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiStarOutline} size={0.6} />
                                                    <span className="text-nowrap">Đánh giá</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="orange">
                                                    {venueData?.averageRating ? venueData.averageRating.toFixed(1) : "0.0"} / 5.0
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiEmail} size={0.6} />
                                                    <span className="text-nowrap">Email liên hệ</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">
                                                    {typeof venueData?.ownerId === 'object' ? venueData?.ownerId?.email : "-"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiPhone} size={0.6} />
                                                    <span className="text-nowrap">Số điện thoại</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">
                                                    {typeof venueData?.ownerId === 'object' ? venueData?.ownerId?.phone : "-"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Section: Courts List */}
                            <div className="flex items-center gap-3 md:gap-4 mt-4">
                                <h3 className="text-secondary font-semibold whitespace-nowrap">Danh sách sân con</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 text-center">STT</TableHead>
                                            <TableHead>Tên sân</TableHead>
                                            <TableHead>Loại sân</TableHead>
                                            <TableHead className="text-center">Trạng thái</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!venueData?.courts || venueData.courts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4}>
                                                    <div className="text-center text-neutral-400 text-base py-4 italic flex items-center justify-center gap-2">
                                                        <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                                        Chưa có sân con nào được tạo.
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            venueData.courts.map((court: any, idx: number) => (
                                                <TableRow key={court._id}>
                                                    <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                                                    <TableCell className="text-secondary">{court.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="neutral">{court.type}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={court.status === 'AVAILABLE' ? 'green' : 'red'}>
                                                            {court.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Bận'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Section: Map */}
                            <div className="flex items-center gap-3 md:gap-4 mt-4">
                                <h3 className="text-secondary font-semibold whitespace-nowrap">Vị trí bản đồ</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

                            <div className="bg-accent/5 border border-dashed border-accent/40 rounded-lg overflow-hidden">
                                <div className="h-64 w-full bg-darkBackgroundV1">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        src={`https://maps.google.com/maps?q=${venueData?.coordinates?.coordinates[1]},${venueData?.coordinates?.coordinates[0]}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
