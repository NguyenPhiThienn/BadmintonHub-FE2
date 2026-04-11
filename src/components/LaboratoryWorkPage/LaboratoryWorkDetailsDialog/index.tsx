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
import { useMe } from "@/hooks/useAuth";
import { useTestCategoryTree, useTestJobDetails } from "@/hooks/useTesting";
import { ITestCategory, ITestingDevice } from "@/interface/testing";
import { cn } from "@/lib/utils";
import {
    mdiAccountCheckOutline,
    mdiAccountOutline,
    mdiArchiveEyeOutline,
    mdiBarcode,
    mdiCalendar,
    mdiCalendarClock,
    mdiClipboardCheckOutline,
    mdiClose,
    mdiCurrentAc,
    mdiFilePdfBox,
    mdiFlash,
    mdiInformationOutline,
    mdiLoading,
    mdiOfficeBuilding,
    mdiPlaylistRemove,
    mdiSpeedometer,
    mdiSquareEditOutline,
    mdiTagOutline,
    mdiThermometer,
    mdiToolboxOutline,
    mdiWaterPercent
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { LaboratoryWorkDialog } from "../LaboratoryWorkDialog";

interface LaboratoryWorkDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string | null;
}

export const LaboratoryWorkDetailsDialog = ({
    isOpen,
    onClose,
    jobId,
}: LaboratoryWorkDetailsDialogProps) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { data: profileResponse } = useMe();
    const profile = profileResponse?.data;
    const isPartner = profile?.role === "partner";

    const { data: jobResponse, isLoading: isJobLoading } = useTestJobDetails(jobId || "");
    const job = jobResponse?.data;
    const device = job?.deviceId as ITestingDevice | undefined;
    const deviceTypeId = typeof device?.deviceTypeId === "string"
        ? device.deviceTypeId
        : (device?.deviceTypeId as any)?._id || "";

    const { data: categoriesResponse, isLoading: isCategoriesLoading } = useTestCategoryTree(deviceTypeId);
    const categories = categoriesResponse?.data || [];

    const isLoading = isJobLoading || isCategoriesLoading;

    if (!jobId) return null;

    const renderTestResult = (category: ITestCategory, index: number, prefix: string = "") => {
        const result = job?.testResults?.[category._id];
        const isSkipped = result?.isSkipped;
        const evaluation = result?.evaluation;
        const value = result?.value;

        const currentNumber = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;

        return (
            <div key={category._id}>
                <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-accent font-semibold text-sm">
                            {currentNumber}. {category.name}
                        </span>
                        {evaluation === "Đạt" && <Badge variant="green">ĐẠT</Badge>}
                        {evaluation === "Không đạt" && <Badge variant="red">KHÔNG ĐẠT</Badge>}
                        {isSkipped && <Badge variant="orange">BỎ QUA</Badge>}
                    </div>
                </div>

                {!isSkipped && (
                    <div className="space-y-4 pl-2">
                        {category.contentType === "TABLE" && value && Array.isArray(value) && value.length > 0 && (
                            <div className="overflow-x-auto border border-darkBorderV1 rounded-none">
                                <table className="w-full text-sm text-center border-collapse table-auto">
                                    <thead>
                                        <tr className="bg-darkBackgroundV1/50">
                                            <th className="p-2 border border-darkBorderV1 text-neutral-400 w-12 font-semibold">#</th>
                                            {Array.isArray(category.config) ? (
                                                category.config.map((col: any, i: number) => (
                                                    <th key={i} className="p-2 border border-darkBorderV1 text-accent font-semibold">
                                                        {(col.name || col.Name)} {(col.unit || col.Unit) && <span className="text-sm text-neutral-400 font-normal italic">({col.unit || col.Unit})</span>}
                                                    </th>
                                                ))
                                            ) : (
                                                value[0] && Object.keys(value[0]).map((key, i) => (
                                                    <th key={i} className="p-2 border border-darkBorderV1 text-accent font-semibold">{key}</th>
                                                ))
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {value.map((row: any, rIdx: number) => (
                                            <tr key={rIdx}>
                                                <td className="p-2 border border-darkBorderV1 bg-darkBackgroundV1/50 text-neutral-400 font-medium">{rIdx + 1}</td>
                                                {Array.isArray(category.config) ? (
                                                    category.config.map((col: any, cIdx: number) => {
                                                        const cName = col.name || col.Name;
                                                        return (
                                                            <td key={cIdx} className="p-2 border border-darkBorderV1 text-neutral-300">
                                                                {row[cName]}
                                                            </td>
                                                        );
                                                    })
                                                ) : (
                                                    row && Object.keys(row).map((key, cIdx) => (
                                                        <td key={cIdx} className="p-2 border border-darkBorderV1 text-neutral-300">
                                                            {row[key]}
                                                        </td>
                                                    ))
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {category.contentType === "MERGE_TABLE" && (
                            <MergeTableView config={category.config} value={value} />
                        )}
                        {category.children && category.children.length > 0 && (
                            <div className="space-y-4 mt-2">
                                {category.children.map((child, i) => renderTestResult(child, i, currentNumber))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiArchiveEyeOutline} size={0.8} className="flex-shrink-0" />
                        <span>Chi tiết biên bản thí nghiệm</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 md:space-y-8 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    {isLoading || !job ? (
                        <div className="text-center text-neutral-400 text-base py-10 italic flex items-center justify-center gap-2">
                            <Icon path={mdiLoading} size={0.8} className="animate-spin flex-shrink-0" />
                            Đang tải chi tiết biên bản...
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* SECTION I */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-accent font-semibold whitespace-nowrap">I. Thông tin thiết bị</h3>
                                    <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                </div>

                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiTagOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Tên thiết bị</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-accent font-bold">
                                                    {(device as any)?.operatingName ? <Badge variant="green">{(device as any)?.operatingName}</Badge> : <span className="text-neutral-400 italic">Chưa có tên vận hành</span  >}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiBarcode} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Mã thiết bị</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{(device as any)?.equipmentCode || ""}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiOfficeBuilding} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Hãng sản xuất</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{(device as any)?.manufacturer || ""}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiTagOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Tên chỉ danh</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{(device as any)?.designatedName || ""}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiCalendar} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Ngày vận hành</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{(device as any)?.commissioningDate ? format(new Date((device as any).commissioningDate), "dd/MM/yyyy") : ""}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiCalendarClock} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Thời hạn bảo hành (Tháng)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {(device as any)?.warrantyMonths ? <Badge variant="neutral">{(device as any)?.warrantyMonths} tháng</Badge> : <span className="text-neutral-400 italic">Chưa có thời hạn bảo hành</span>}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiCalendar} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Năm sản xuất (Year of manufacture)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {(device as any)?.productionYear ? <Badge variant="neutral">{(device as any)?.productionYear}</Badge> : <span className="text-neutral-400 italic">Chưa có năm sản xuất</span>}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiInformationOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Kiểu máy (Type)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {(device as any)?.deviceModel ? <Badge variant="neutral">{(device as any)?.deviceModel}</Badge> : <span className="text-neutral-400 italic">Chưa có kiểu máy</span>}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiFlash} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Điện áp định mức (Rated voltage)(kV)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {(device as any)?.nominalVoltage ? <Badge variant="neutral">{(device as any)?.nominalVoltage}</Badge> : <span className="text-neutral-400 italic">Chưa có điện áp định mức</span>}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiCurrentAc} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Dòng định mức (A) (Rated current)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {(device as any)?.nominalCurrent ? <Badge variant="neutral">{(device as any)?.nominalCurrent}</Badge> : <span className="text-neutral-400 italic">Chưa có dòng định mức</span>}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiSpeedometer} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Dòng cắt ngắn mạch định mức (kA)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {(device as any)?.shortCircuitCurrent ? <Badge variant="neutral">{(device as any)?.shortCircuitCurrent}</Badge> : <span className="text-neutral-400 italic">Chưa có dòng cắt ngắn mạch</span>}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiBarcode} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Số chế tạo (Serial No)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">
                                                        {(() => {
                                                            const serialStr = (device as any)?.serialJson;
                                                            if (!serialStr) return "";
                                                            try {
                                                                const parsed = JSON.parse(serialStr);
                                                                return parsed.data?.serial_1_1 || serialStr;
                                                            } catch {
                                                                return serialStr;
                                                            }
                                                        })()}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>

                            {/* SECTION II */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-accent font-semibold whitespace-nowrap">II. Thông tin thí nghiệm</h3>
                                    <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                </div>

                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiTagOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Vị trí lắp đặt (Site)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-accent font-bold">
                                                    <Badge variant="green">{(job as any)?.site || ""}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiOfficeBuilding} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Tên dự án/tên trạm (Project)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell >
                                                    <Badge variant="neutral">{job.projectName || ""}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiClipboardCheckOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Loại thí nghiệm</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell >
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="neutral">{job.testType || ""}</Badge>
                                                        {job.testType === "Tăng cường" && job.reinforcementContent && (
                                                            <span className="text-xs text-neutral-400 italic">({job.reinforcementContent})</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiBarcode} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Số biên bản</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300 font-bold">
                                                    <Badge variant="neutral">{job.reportNumber}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiInformationOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Lý do thí nghiệm (Purpose of test)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {job.purpose || <span className="text-neutral-400 italic">Chưa có lý do thí nghiệm</span>}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiCalendarClock} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Ngày thí nghiệm (Date)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300">
                                                    <Badge variant="neutral">{job.testDate ? format(new Date(job.testDate), "dd/MM/yyyy") : ""}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiThermometer} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Nhiệt độ (Temp)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300">
                                                    {job.temperature ? job.temperature + "°C" : <span className="text-neutral-400 italic">Chưa có nhiệt độ</span>}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiWaterPercent} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Độ ẩm (Humidity)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300">
                                                    {job.humidity ? job.humidity + "%" : <span className="text-neutral-400 italic">Chưa có độ ẩm</span>}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiAccountOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Người thực hiện</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{job.testerName}</Badge></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiAccountCheckOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Người kiểm duyệt</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{job.approverName}</Badge></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiToolboxOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Dụng cụ thí nghiệm</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300">
                                                    {job.testingTools ? (
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            {job.testingTools.split(";").filter((item: string) => item.trim()).map((tool: string, index: number) => (
                                                                <li key={index} className="text-sm">{tool.trim()}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        ""
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow className="bg-accent/5">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiInformationOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Kết luận chung</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300">{job.conclusion || ""}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiClipboardCheckOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Trạng thái (Status)</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {job.status === "Đạt" ? (
                                                            <Badge variant="green">ĐẠT (PASS)</Badge>
                                                        ) : (
                                                            <Badge variant="red">KHÔNG ĐẠT (FAIL)</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="w-[280px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiInformationOutline} size={0.6} className="flex-shrink-0" />
                                                        <span className="text-neutral-300 font-semibold text-nowrap">Ghi chú</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {job.notes || <span className="text-neutral-400 italic">Chưa có ghi chú</span>}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>

                            {/* SECTION III */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-accent font-semibold whitespace-nowrap">III. Kết quả đo lường</h3>
                                    <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                </div>

                                {categories.length > 0 ? (
                                    <div className="space-y-4">
                                        {categories.map((cat: any, i: number) => renderTestResult(cat, i))}
                                    </div>
                                ) : (
                                    <div className="text-center text-neutral-400 text-base py-4 italic flex items-center justify-center gap-2">
                                        <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" />
                                        Không có chi tiết kết quả.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    <Button asChild>
                        <Link href={`/laboratory-work/preview/${jobId}`} target="_blank">
                            <Icon path={mdiFilePdfBox} size={0.8} />
                            Xem biên bản
                        </Link>
                    </Button>
                    {!isPartner && (
                        <Button onClick={() => setIsEditDialogOpen(true)}>
                            <Icon path={mdiSquareEditOutline} size={0.8} />
                            Cập nhật
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>

            <LaboratoryWorkDialog
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                device={device || null}
                job={job}
            />
        </Dialog >
    );
};

const MergeTableView = ({ config, value }: { config: any, value: any }) => {
    if (!config || !config.cells) return null;

    const { cols, cells } = config;
    const values = value || {};

    return (
        <div className="overflow-auto border border-darkBorderV1 rounded-md bg-darkBackgroundV1 p-2 custom-scrollbar">
            <table className="border-collapse table-fixed mx-auto" style={{ width: `${cols * 150}px`, minWidth: '100%' }}>
                <colgroup>
                    {Array.from({ length: cols }).map((_, i) => (
                        <col key={i} style={{ width: '150px' }} />
                    ))}
                </colgroup>
                <tbody>
                    {cells.map((rowArr: any[], rIndex: number) => (
                        <tr key={`rv-${rIndex}`}>
                            {rowArr.map((cell: any) => {
                                if (cell.isMergedOut) return null;

                                const cellLabel = cell.value || cell.label;
                                const hasLabel = cell.type === "label" && cellLabel && cellLabel.trim() !== "";

                                return (
                                    <td
                                        key={cell.id}
                                        rowSpan={cell.rowSpan}
                                        colSpan={cell.colSpan}
                                        className={cn(
                                            "border border-darkBorderV1 p-2 text-center text-sm min-h-[48px]",
                                            hasLabel ? "bg-darkBackgroundV1/30" : "bg-transparent"
                                        )}
                                    >
                                        {hasLabel ? (
                                            <span className="font-semibold text-accent break-words whitespace-normal">
                                                {cellLabel}
                                            </span>
                                        ) : (
                                            <span className="text-neutral-300 break-words whitespace-normal font-medium italic">
                                                {values[cell.id]}
                                            </span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
