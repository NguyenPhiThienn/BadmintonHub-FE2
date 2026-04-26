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
    mdiMap,
    mdiMapMarkerOutline,
    mdiPhone,
    mdiStarOutline,
    mdiStoreOutline
} from "@mdi/js";
import { motion } from "framer-motion";
import Icon from "@mdi/react";
import { formatDateWithTime } from "@/lib/format";

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
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiStoreOutline} size={0.8} className="flex-shrink-0" />
                        <span>Chi tiết cơ sở sân: {venueData?.name}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
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

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <Skeleton className="h-6 w-40" />
                                    <div className="flex-1 border-b border-dashed border-accent/20" />
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            {[...Array(2)].map((_, i) => (
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
                            {/* Basic Info */}
                            <div className="flex items-center gap-3 md:gap-4 mb-2">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiStoreOutline} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Tên cơ sở</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{venueData?.name}</Badge>
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
                                                <Badge variant="neutral">{venueData?.address}</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiAccount} size={0.6} className="flex-shrink-0" />
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
                                                    <Icon path={mdiInformationOutline} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Trạng thái</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={venueData?.status === 'ACTIVE' ? 'green' : venueData?.status === 'PENDING' ? 'yellow' : 'red'}
                                                >
                                                    {venueData?.status === 'ACTIVE' ? 'Hoạt động' : venueData?.status === 'PENDING' ? 'Chờ duyệt' : 'Đã khóa'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiEmail} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Email chủ sân</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">
                                                    {typeof venueData?.ownerId === 'object' ? venueData?.ownerId?.email : "-"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiPhone} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">SĐT chủ sân</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">
                                                    {typeof venueData?.ownerId === 'object' ? venueData?.ownerId?.phone : "-"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiStarOutline} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Đánh giá</span>
                                                </div>
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                                <Badge variant="orange">
                                                    {venueData?.averageRating ? venueData.averageRating.toFixed(1) : "0.0"} / 5.0
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Operational Info */}
                            <div className="flex items-center gap-3 md:gap-4 mt-6 mb-2">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin hoạt động</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiClockOutline} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Giờ mở cửa</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{venueData?.openTime}</Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiClockOutline} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Giờ đóng cửa</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{venueData?.closeTime}</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiCurrencyUsd} size={0.6} className="flex-shrink-0" />
                                                    <span className="text-nowrap">Giá thuê</span>
                                                </div>
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                                <Badge variant="green" className="text-base">
                                                    {venueData?.pricePerHour?.toLocaleString()} đ / giờ
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Description */}
                            <div className="flex items-center gap-3 md:gap-4 mt-6 mb-2">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Mô tả chi tiết</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>
                            <Card className="p-4 border border-darkBorderV1 bg-transparent text-neutral-300 text-sm italic leading-relaxed mb-6">
                                {venueData?.description || "Không có mô tả cho cơ sở này."}
                            </Card>

                            {/* Map Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="bg-accent/5 border border-dashed border-accent/40 rounded-2xl overflow-hidden mb-4">
                                    <div className="p-4 border-b border-darkBorderV1/50 flex items-center gap-2">
                                        <Icon path={mdiMap} size={0.8} className="text-accent" />
                                        <p className="text-accent text-lg font-semibold">Vị trí sân trên bản đồ</p>
                                    </div>
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
                            </motion.div>
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
