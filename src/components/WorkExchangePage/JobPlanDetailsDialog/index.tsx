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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useJobPlanDetails } from "@/hooks/useJobPlans";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiArchiveEyeOutline,
    mdiCalendarMonth,
    mdiClose,
    mdiHandshakeOutline,
    mdiInformationOutline,
    mdiLoading,
    mdiOfficeBuilding,
    mdiTextLong
} from "@mdi/js";
import Icon from "@mdi/react";

interface JobPlanDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    planId: string | null;
}

export const JobPlanDetailsDialog = ({
    isOpen,
    onClose,
    planId,
}: JobPlanDetailsDialogProps) => {
    const { data: planResponse, isLoading } = useJobPlanDetails(planId || "");
    const plan = planResponse?.data;
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Đã duyệt":
                return "green";
            case "Đang trao đổi":
                return "blue";
            case "Từ chối":
                return "red";
            default:
                return "neutral";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="small">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiArchiveEyeOutline} size={0.8} />
                        <span>Chi tiết phương án: {plan?.planName || "Chưa cập nhật"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400 italic">
                            <Icon path={mdiLoading} size={1.2} className="animate-spin" />
                            <p>Đang tải thông tin phương án...</p>
                        </div>
                    ) : plan ? (
                        <div className="space-y-4">
                            <div className="space-y-4">


                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiHandshakeOutline} size={0.6} />
                                                        <span>Tên phương án</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <Badge variant="green">{plan.planName}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiOfficeBuilding} size={0.6} />
                                                        <span>Đối tác / Đơn vị</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-accent font-medium uppercase">
                                                    {typeof plan.partnerId === "object" ? (plan.partnerId as any).partnerName : ""}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiInformationOutline} size={0.6} />
                                                        <span>Trạng thái</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <Badge variant={getStatusVariant(plan.status)}>
                                                        {plan.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiCalendarMonth} size={0.6} />
                                                        <span>Ngày tạo</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{formatDateWithTime(plan.createdAt)}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiCalendarMonth} size={0.6} />
                                                        <span>Cập nhật cuối</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{formatDateWithTime(plan.updatedAt)}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px] align-top py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiTextLong} size={0.6} />
                                                        <span>Nội dung trao đổi</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300 whitespace-pre-wrap leading-relaxed py-4">
                                                    {plan.summary || <span className="text-neutral-400 italic">Chưa có nội dung trao đổi chi tiết.</span>}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-neutral-400 italic">
                            Không tìm thấy dữ liệu phương án.
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 bg-darkCardV1 border-t border-darkBorderV1">
                    <Button variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
