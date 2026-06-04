import { Badge } from "@/components/ui/badge";
import { IBooking } from "@/interface/booking";
import { Icon } from "@/components/ui/mdi-icon";
import {
    mdiCheckCircle,
    mdiClock,
    mdiPlaylistRemove,
    mdiInformationOutline,
    mdiAlertCircleOutline
} from "@mdi/js";

interface BookingStatusBadgeProps {
    booking: IBooking;
    showIcon?: boolean;
}

export const BookingStatusBadge = ({ booking, showIcon = true }: BookingStatusBadgeProps) => {
    if (booking.status === 'CANCELLED' && booking.payment?.status === 'REFUNDING') {
        return (
            <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/30 w-[140px] h-[28px] justify-center whitespace-nowrap text-xs font-medium">
                {showIcon && <Icon path={mdiInformationOutline} size={0.6} className="mr-1" />}
                Đang chờ hoàn tiền
            </Badge>
        );
    }
    if (booking.status === 'CANCELLED' && booking.payment?.status === 'REFUNDED') {
        return (
            <Badge className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border-cyan-500/30 w-[140px] h-[28px] justify-center whitespace-nowrap text-xs font-medium">
                {showIcon && <Icon path={mdiCheckCircle} size={0.6} className="mr-1" />}
                Đã hoàn tiền
            </Badge>
        );
    }

    let variant: any = "neutral";
    let text: string = booking.status;
    let iconPath: string | null = null;
    let customIcon: React.ReactNode = null;

    switch (booking.status) {
        case "PENDING":
            if (booking.payment?.method === "CASH") {
                variant = "amber";
                text = "Chờ xác nhận";
            } else {
                variant = "amber";
                text = "Chờ thanh toán";
            }
            if (showIcon) {
                customIcon = <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1.5" />;
            }
            break;
        case "CONFIRMED":
            variant = "green";
            text = "Đã xác nhận";
            iconPath = mdiCheckCircle;
            break;
        case "IN_PROGRESS":
            variant = "blue";
            text = "Đang chơi";
            iconPath = mdiClock;
            break;
        case "LATE_ARRIVAL":
            variant = "orange";
            text = "Khách đến trễ";
            iconPath = mdiClock;
            break;
        case "COMPLETED":
            variant = "teal";
            text = "Hoàn thành đơn";
            iconPath = mdiCheckCircle;
            break;
        case "CANCELLED":
            variant = "destructive";
            text = "Đã hủy đơn";
            iconPath = mdiPlaylistRemove;
            break;
        case "NO_SHOW":
            variant = "slate";
            text = "Khách không đến";
            iconPath = mdiPlaylistRemove;
            break;
    }

    const mainBadge = (
        <Badge variant={variant} className="whitespace-nowrap w-[140px] h-[28px] justify-center text-xs font-medium">
            {showIcon && iconPath && !customIcon && (
                <Icon path={iconPath} size={0.6} className="mr-1" />
            )}
            {customIcon}
            {text}
        </Badge>
    );

    const isDebt = booking.status === 'COMPLETED' && booking.payment?.status === 'DEBT';

    if (isDebt) {
        return (
            <div className="flex flex-col items-center gap-1.5">
                {mainBadge}
                <Badge className="bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 border-pink-500/30 whitespace-nowrap w-[140px] h-[28px] justify-center text-xs font-medium">
                    {showIcon && <Icon path={mdiAlertCircleOutline} size={0.6} className="mr-1" />}
                    Khách nợ
                </Badge>
            </div>
        );
    }

    return mainBadge;
};
