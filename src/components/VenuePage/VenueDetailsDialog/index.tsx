"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { useVenueDetails, useVenuePricing } from "@/hooks/useVenue";
import { IVenue } from "@/interface/venue";
import {
    mdiAccount,
    mdiClose,
    mdiClockOutline,
    mdiCurrencyUsd,
    mdiEmail,
    mdiInformationOutline,
    mdiMapMarkerOutline,
    mdiPhone,
    mdiPlaylistRemove,
    mdiStar,
    mdiStarOutline,
    mdiStoreOutline,
    mdiTagOutline
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
    const router = useRouter();
    const venueId = venue?._id || "";
    const { data: venueDetailsResponse, isLoading: isDetailsLoading } = useVenueDetails(venueId);
    const { data: pricingResponse, isLoading: isPricingLoading } = useVenuePricing(venueId);

    const venueData = venueDetailsResponse?.data || venue;
    const pricings = pricingResponse?.data || [];

    const handleViewReviews = () => {
        if (venue?._id) {
            router.push(`/venues/${venue._id}`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
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
                            {/* Section: Images */}
                            {venueData?.images && venueData.images.length > 0 && (
                                <>
                                    <div className="flex items-center gap-3 md:gap-4 mt-4">
                                        <h3 className="text-accent font-semibold whitespace-nowrap">Hình ảnh cơ sở</h3>
                                        <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {venueData.images.map((img: any, idx: number) => (
                                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-darkBorderV1 bg-darkBorderV1">
                                                <Image
                                                    src={img.imageUrl}
                                                    alt={`${venueData?.name} - Ảnh ${idx + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Section: Basic Info */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
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
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="neutral">{venueData?.name}</Badge>
                                                    {venueData?.status === 'PENDING' && (
                                                        <Badge variant="yellow">Chờ duyệt</Badge>
                                                    )}
                                                    {venueData?.status === 'REJECTED' && (
                                                        <Badge variant="red">Bị từ chối</Badge>
                                                    )}
                                                    {venueData?.status === 'ACTIVE' && (
                                                        <Badge variant="green">Hoạt động</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {(venueData?.status === 'REJECTED' || venueData?.statusReason) && (
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                    <span className="text-nowrap">Lý do</span>
                                                </TableCell>
                                                <TableCell colSpan={3}>
                                                    <Badge variant="red">{venueData?.statusReason || '-'}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        )}
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
                                                    {venueData?.pricePerHour?.toLocaleString()} đ / giờ (Mặc định)
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
                                                {venueData?.averageRating && venueData.averageRating > 0 ? (
                                                    <Badge variant="orange">
                                                        {venueData.averageRating.toFixed(1)} / 5.0
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="ghost" className="text-neutral-500">
                                                        Chưa có đánh giá
                                                    </Badge>
                                                )}
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

                            {/* Section: Pricing */}
                            {pricings && pricings.length > 0 && (
                                <>
                                    <div className="flex items-center gap-3 md:gap-4 mt-4">
                                        <h3 className="text-accent font-semibold whitespace-nowrap">Bảng giá theo khung giờ</h3>
                                        <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                    </div>

                                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12 text-center">STT</TableHead>
                                                    <TableHead>Khung giờ</TableHead>
                                                    <TableHead>Nhãn</TableHead>
                                                    <TableHead>Ngày áp dụng</TableHead>
                                                    <TableHead className="text-right">Giá thuê</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pricings.map((pricing: any, idx: number) => {
                                                    const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
                                                    const dayLabel = pricing.dayOfWeek !== null && pricing.dayOfWeek !== undefined 
                                                        ? days[pricing.dayOfWeek] 
                                                        : "Tất cả các ngày";
                                                    return (
                                                        <TableRow key={pricing._id}>
                                                            <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                                                            <TableCell className="text-accent font-semibold">{pricing.startTime} - {pricing.endTime}</TableCell>
                                                            <TableCell>
                                                                {pricing.label ? (
                                                                    <Badge variant="outline2" className="text-accent border-accent/30 bg-accent/10 flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full whitespace-nowrap text-xs font-medium">
                                                                        <Icon path={mdiTagOutline} size={0.5} className="mr-0.5" />
                                                                        {pricing.label}
                                                                    </Badge>
                                                                ) : "-"}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-neutral-400 text-sm">{dayLabel}</span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Badge variant="green">{pricing.pricePerHour?.toLocaleString()} đ/giờ</Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                </>
                            )}

                            {/* Section: Courts List */}
                            <div className="flex items-center gap-3 md:gap-4 mt-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap">Danh sách sân con</h3>
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
                                                    <TableCell className="text-accent">{court.name}</TableCell>
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
                                <h3 className="text-accent font-semibold whitespace-nowrap">Vị trí bản đồ</h3>
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
                    <Button variant="accent" onClick={handleViewReviews}>
                        <Icon path={mdiStar} size={0.8} />
                        Xem đánh giá
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
