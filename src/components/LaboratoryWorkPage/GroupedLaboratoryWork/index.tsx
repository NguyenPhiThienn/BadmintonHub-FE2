"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IGroupedTestJob } from "@/interface/testing";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiCalendarClock,
    mdiClipboardCheckOutline,
    mdiDomain,
    mdiEye,
    mdiFilePdfBox,
    mdiLoading,
    mdiPlaylistRemove,
    mdiPlusCircleMultipleOutline,
    mdiSquareEditOutline,
    mdiTransmissionTower,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import Link from "next/link";

interface GroupedLaboratoryWorkProps {
    data: IGroupedTestJob[] | undefined;
    isLoading: boolean;
    onViewDetails: (job: any) => void;
    onEdit: (job: any) => void;
    onDelete: (job: any) => void;
    onCopy: (job: any) => void;
    isPartner?: boolean;
}

export const GroupedLaboratoryWork = ({
    data,
    isLoading,
    onViewDetails,
    onEdit,
    onDelete,
    onCopy,
    isPartner,
}: GroupedLaboratoryWorkProps) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Icon path={mdiLoading} size={1.5} className="animate-spin text-accent" />
                <p className="text-neutral-400 italic">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center text-neutral-400 text-base py-10 italic flex items-center justify-center gap-2">
                <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                Không tìm thấy công việc thí nghiệm
            </div>
        );
    }

    return (
        <div className="mt-4">
            <Accordion type="multiple" className="space-y-4">
                {data.map((partner) => (
                    <AccordionItem key={partner.partnerId} value={partner.partnerId} className="border-none">
                        {/* Level 1: Partner/Company - Root Style */}
                        <AccordionTrigger className="flex items-center gap-3 py-2 px-3 bg-accent/50 border rounded-md group border-accent/30 transition-all hover:no-underline [&>svg]:text-white">
                            <div className="flex-shrink-0 w-fit h-8 px-3 border border-darkBorderV1 rounded-full flex gap-1 items-center justify-center bg-accent text-white shadow-lg shadow-accent/20">
                                <Icon path={mdiDomain} size={0.8} />
                                <span className="text-sm font-semibold text-white">Tên công ty: {partner.partnerName}</span>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent className="pb-0 pt-2">
                            <div className="relative">
                                {/* Level 2: Years - Child Style */}
                                <div className="relative ml-[17px] border-l-2 border-darkBorderV1 pl-6 py-2 space-y-3">
                                    {partner.years.map((yearGroup) => (
                                        <div key={yearGroup.year} className="relative">
                                            {/* Horizontal Connector to Year */}
                                            <div className="absolute -left-6 top-[22px] w-6 h-[2px] bg-darkBorderV1" />

                                            <div className="flex items-center gap-3 py-2 px-3 bg-darkBackgroundV1 border border-darkBorderV1 rounded-md group hover:border-accent/20 transition-all">
                                                <div className="flex-shrink-0 w-fit h-8 px-3 border border-darkCardV1 rounded-full flex gap-1 items-center justify-center bg-darkBackgroundV1 text-neutral-300">
                                                    <Icon path={mdiCalendarClock} size={0.8} />
                                                    <span className="text-sm font-semibold text-neutral-300">
                                                        Năm {yearGroup.year}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Level 3: Bays - Child Style */}
                                            <div className="relative ml-[17px] border-l-2 border-darkBorderV1 pl-6 py-2 space-y-3">
                                                {yearGroup.bays.map((bay) => (
                                                    <div key={bay.bayId} className="relative">
                                                        {/* Horizontal Connector to Bay */}
                                                        <div className="absolute -left-6 top-[22px] w-6 h-[2px] bg-darkBorderV1" />

                                                        <div className="flex items-center gap-3 py-2 px-3 bg-darkBackgroundV1 border border-darkBorderV1 rounded-md group transition-all">
                                                            <div className="flex-shrink-0 w-fit h-8 px-3 border border-darkCardV1 rounded-full flex gap-1 items-center justify-center bg-darkBackgroundV1 text-neutral-300">
                                                                <Icon path={mdiTransmissionTower} size={0.8} />
                                                                <span className="text-sm font-semibold text-neutral-300">
                                                                    Ngăn lộ: {bay.bayName}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Level 4: Test Jobs / Devices - Child Style */}
                                                        <div className="relative ml-[17px] border-l-2 border-darkBorderV1 pl-6 py-2 space-y-2">
                                                            {bay.testJobs.map((job) => (
                                                                <div key={job._id} className="relative">
                                                                    {/* Horizontal Connector to Job */}
                                                                    <div className="absolute -left-6 top-[22px] w-6 h-[2px] bg-darkBorderV1" />

                                                                    <div
                                                                        onClick={() => onViewDetails(job)}
                                                                        className="flex items-center justify-between py-2 px-3 bg-darkBorderV1 border border-accent/10 rounded-md hover:bg-accent/5 cursor-pointer group transition-all"
                                                                    >
                                                                        <div className="flex items-center gap-3 min-w-0">
                                                                            <div className="flex-shrink-0 w-fit h-8 px-3 border border-darkCardV1 rounded-full flex gap-1 items-center justify-center bg-darkBackgroundV1 text-neutral-300">
                                                                                <Icon path={mdiClipboardCheckOutline} size={0.8} />
                                                                                <span className="text-sm font-semibold text-neutral-300">
                                                                                    Thiết bị: {job.operatingName}
                                                                                </span>
                                                                            </div>
                                                                            <Badge variant="neutral">
                                                                                Ngày tạo biên bản: {formatDateWithTime(job.createdAt)}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="flex justify-end space-x-2">
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button asChild onClick={(e) => e.stopPropagation()}>
                                                                                            <Link href={`/laboratory-work/preview/${job._id}`} target="_blank">
                                                                                                <Icon path={mdiFilePdfBox} size={0.8} />
                                                                                                Xem biên bản
                                                                                            </Link>
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>Xem biên bản</TooltipContent>
                                                                                </Tooltip>
                                                                                {!isPartner && <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                onCopy(job);
                                                                                            }}
                                                                                        >
                                                                                            <Icon path={mdiPlusCircleMultipleOutline} size={0.8} />
                                                                                            Sao chép biên bản
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>Sao chép và tạo mới biên bản</TooltipContent>
                                                                                </Tooltip>}

                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            size={isPartner ? "default" : "icon"}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                onViewDetails(job);
                                                                                            }}
                                                                                        >
                                                                                            <Icon path={mdiEye} size={0.8} />
                                                                                            {isPartner ? "Xem chi tiết kết quả" : ""}
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>Chi tiết kết quả</TooltipContent>
                                                                                </Tooltip>

                                                                                {!isPartner && (
                                                                                    <>
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Button
                                                                                                    size="icon"
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        onEdit(job);
                                                                                                    }}
                                                                                                >
                                                                                                    <Icon path={mdiSquareEditOutline} size={0.8} />
                                                                                                </Button>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>Cập nhật kết quả</TooltipContent>
                                                                                        </Tooltip>

                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Button
                                                                                                    size="icon"
                                                                                                    variant="destructive"
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        onDelete(job);
                                                                                                    }}
                                                                                                >
                                                                                                    <Icon path={mdiTrashCanOutline} size={0.8} />
                                                                                                </Button>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>Xóa kết quả</TooltipContent>
                                                                                        </Tooltip>
                                                                                    </>
                                                                                )}
                                                                            </TooltipProvider>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};
