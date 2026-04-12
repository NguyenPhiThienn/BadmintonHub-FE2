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
import { FileRecordCard } from "@/components/ui/FileRecordCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMe } from "@/hooks/useAuth";
import { useTestingDeviceDetails, useTestJobs, useUpdateTestingDevice } from "@/hooks/useTesting";
import { useUploadImage, useUploadPdf } from "@/hooks/useUpload";
import { ITestingDeviceRecord } from "@/interface/testing";
import {
    mdiArchiveEyeOutline,
    mdiBarcode,
    mdiCalendarAlert,
    mdiCalendarClock,
    mdiChartLine,
    mdiClose,
    mdiEye,
    mdiFactory,
    mdiFileDocumentOutline,
    mdiFilePdfBox,
    mdiFlask,
    mdiHistory,
    mdiImageOutline,
    mdiInformationOutline,
    mdiLoading,
    mdiNumeric,
    mdiOfficeBuilding,
    mdiPlus,
    mdiSquareEditOutline,
    mdiSync,
    mdiTagOutline,
    mdiToolboxOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { useRef, useState } from "react";
import { LaboratoryWorkDetailsDialog } from "../../LaboratoryWorkPage/LaboratoryWorkDetailsDialog";
import { AddJobDialog } from "../AddJobDialog";

interface TestingDeviceDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    deviceId: string | null;
    onEdit?: (device: any) => void;
}

export const TestingDeviceDetailsDialog = ({
    isOpen,
    onClose,
    deviceId,
    onEdit,
}: TestingDeviceDetailsDialogProps) => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileInputRecordsRef = useRef<HTMLInputElement>(null);
    const fileInputTechnicalRef = useRef<HTMLInputElement>(null);
    const { data: deviceResponse, isLoading } = useTestingDeviceDetails(deviceId || "");
    const device = deviceResponse?.data;
    const { data: profileResponse } = useMe();
    const profile = profileResponse?.data;
    const isPartner = profile?.role === "partner";
    const updateMutation = useUpdateTestingDevice();
    const uploadMutation = useUploadImage();
    const uploadPdfMutation = useUploadPdf();

    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [isWorkDetailsOpen, setIsWorkDetailsOpen] = useState(false);
    const [isAddJobOpen, setIsAddJobOpen] = useState(false);

    // Fetch test jobs history
    const { data: jobsResponse, isLoading: isJobsLoading } = useTestJobs({ deviceId: deviceId || "" });
    const testJobs = jobsResponse?.data || [];

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Chưa cập nhật";
        try {
            return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
        } catch (e) {
            return "Chưa cập nhật";
        }
    };

    const renderSerialGrid = () => {
        if (!device?.serialJson) return null;
        try {
            const serial = typeof device.serialJson === 'string' ? JSON.parse(device.serialJson) : device.serialJson;
            const rows = serial.rows || 1;
            const cols = serial.cols || 1;
            const data = serial.data || {};

            return (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin Serial (Serial Nº)</h3>
                        <div className="flex-1 border-b border-dashed border-accent mr-1" />
                    </div>
                    <div className="overflow-x-auto border border-darkBorderV1 rounded-md">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="border border-darkBorderV1 p-2 text-center w-12 text-neutral-400 font-semibold">#</th>
                                    {Array.from({ length: cols }).map((_, cIdx) => (
                                        <th key={cIdx} className="border border-darkBorderV1 p-2 text-center text-accent font-semibold">
                                            Cột {cIdx + 1}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: rows }).map((_, rIdx) => {
                                    const r = rIdx + 1;
                                    return (
                                        <tr key={rIdx}>
                                            <td className="border border-darkBorderV1 p-2 text-center font-semibold text-accent bg-white/5">
                                                H{r}
                                            </td>
                                            {Array.from({ length: cols }).map((_, cIdx) => {
                                                const c = cIdx + 1;
                                                const val = data[`serial_${r}_${c}`] || data[`serial_${r}-${c}`] || data[`serial_${c}_${r}`] || "";
                                                return (
                                                    <td key={cIdx} className="border border-darkBorderV1 p-2 text-center text-neutral-300 min-w-[120px]">
                                                        {val}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } catch (e) {
            return null;
        }
    };

    const EmptyState = ({ icon, message }: { icon: string; message: string }) => (
        <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
            <Icon path={icon} size={0.8} className="flex-shrink-0" />
            {message}
        </div>
    );

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !deviceId) return;

        try {
            const result: any = await uploadMutation.mutateAsync(file);
            const imageUrl = result.data.url;

            const currentImages = device?.images || [];
            await updateMutation.mutateAsync({
                id: deviceId,
                data: {
                    images: [...currentImages, imageUrl]
                }
            });
            e.target.value = "";
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    const handleDeleteImage = async (imgUrl: string) => {
        if (!deviceId || !device) return;
        try {
            const newImages = (device.images || []).filter((url: string) => url !== imgUrl);
            await updateMutation.mutateAsync({
                id: deviceId,
                data: { images: newImages }
            });
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleUploadRecord = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !deviceId) return;

        try {
            const result: any = await uploadPdfMutation.mutateAsync(file);
            const fileUrl = result.data.url;

            const newRecord: Partial<ITestingDeviceRecord> = {
                fileName: file.name,
                fileUrl: fileUrl,
                fileType: file.type || "application/pdf",
                fileSize: file.size
            };

            const currentRecords = device?.records || [];
            await updateMutation.mutateAsync({
                id: deviceId,
                data: {
                    records: [...currentRecords, newRecord]
                }
            });
            e.target.value = "";
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    const handleDeleteRecord = async (recordToDelete: ITestingDeviceRecord) => {
        if (!deviceId || !device) return;
        try {
            const newRecords = (device.records || []).filter((r: ITestingDeviceRecord) => r.fileUrl !== recordToDelete.fileUrl);
            await updateMutation.mutateAsync({
                id: deviceId,
                data: { records: newRecords }
            });
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleUploadTechnical = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !deviceId) return;

        try {
            const result: any = await uploadPdfMutation.mutateAsync(file);
            const fileUrl = result.data.url;

            const newDoc: Partial<ITestingDeviceRecord> = {
                fileName: file.name,
                fileUrl: fileUrl,
                fileType: file.type || "application/pdf",
                fileSize: file.size
            };

            const currentDocs = device?.technicalDocuments || [];
            await updateMutation.mutateAsync({
                id: deviceId,
                data: {
                    technicalDocuments: [...currentDocs, newDoc]
                }
            });
            e.target.value = "";
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    const handleDeleteTechnical = async (docToDelete: ITestingDeviceRecord) => {
        if (!deviceId || !device) return;
        try {
            const newDocs = (device.technicalDocuments || []).filter((r: ITestingDeviceRecord) => r.fileUrl !== docToDelete.fileUrl);
            await updateMutation.mutateAsync({
                id: deviceId,
                data: { technicalDocuments: newDocs }
            });
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiArchiveEyeOutline} size={0.8} />
                        <span>Hồ sơ thiết bị: {device?.operatingName || "Chưa cập nhật"}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <Tabs defaultValue="info" className="w-full">
                        <TabsList>
                            <TabsTrigger value="info">
                                <Icon path={mdiInformationOutline} size={0.8} /> Thông tin chung
                            </TabsTrigger>
                            <TabsTrigger value="images">
                                <Icon path={mdiImageOutline} size={0.8} /> Hình ảnh
                            </TabsTrigger>
                            {!isPartner && <TabsTrigger value="history">
                                <Icon path={mdiHistory} size={0.8} />Lịch sử thí nghiệm
                            </TabsTrigger>}
                            <TabsTrigger value="records">
                                <Icon path={mdiFileDocumentOutline} size={0.8} /> Hồ sơ & Kiểm định
                            </TabsTrigger>
                            <TabsTrigger value="technical">
                                <Icon path={mdiFileDocumentOutline} size={0.8} /> Tài liệu kỹ thuật
                            </TabsTrigger>
                            {!isPartner && <TabsTrigger value="chart">
                                <Icon path={mdiChartLine} size={0.8} /> Biểu đồ
                            </TabsTrigger>}
                        </TabsList>

                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400 italic">
                                <Icon path={mdiLoading} size={1.2} className="animate-spin" />
                                <p>Đang tải thông tin thiết bị...</p>
                            </div>
                        ) : device ? (
                            <>
                                <TabsContent value="info" className="mt-0 outline-none">
                                    <div className="flex flex-col gap-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <h3 className="text-accent font-semibold whitespace-nowrap">Định danh thiết bị</h3>
                                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                            </div>
                                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                                <Table>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiTagOutline} size={0.6} />
                                                                    <span>Tên vận hành</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="green">{device.operatingName}</Badge></TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiBarcode} size={0.6} />
                                                                    <span>Mã thiết bị</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell><Badge variant="neutral">{device.equipmentCode}</Badge></TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiNumeric} size={0.6} />
                                                                    <span>Tên chỉ danh</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell><Badge variant="neutral">{device.designatedName || "Chưa cập nhật"}</Badge></TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiFactory} size={0.6} />
                                                                    <span>Hãng sản xuất</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell><Badge variant="neutral">{device.manufacturer || "Chưa cập nhật"}</Badge></TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiToolboxOutline} size={0.6} />
                                                                    <span>Loại thiết bị</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell><Badge variant="neutral">{typeof device.deviceTypeId === "object" ? (device.deviceTypeId as any).name : "Chưa cập nhật"}</Badge></TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </Card>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <h3 className="text-accent font-semibold whitespace-nowrap">Đơn vị & Vận hành</h3>
                                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                            </div>
                                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                                <Table>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiOfficeBuilding} size={0.6} />
                                                                    <span>Đơn vị quản lý</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-neutral-300">{typeof device.partnerId === "object" ? (device.partnerId as any).partnerName : "Chưa cập nhật"}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiCalendarClock} size={0.6} />
                                                                    <span>Ngày vận hành</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell><Badge variant="neutral">{formatDate(device.commissioningDate)}</Badge></TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiSync} size={0.6} />
                                                                    <span>Chu kỳ TN</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell><Badge variant="neutral">{device.testCycle} (Năm)</Badge></TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon path={mdiCalendarAlert} size={0.6} />
                                                                    <span>Hạn TN tiếp theo</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-orange-400 italic">Không có dữ liệu</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </Card>
                                        </div>

                                        {/* VT/CT Specific Fields */}
                                        {(device.deviceTypeId as any)?.name === "Máy biến điện áp" && (device.productionYear || device.deviceModel || device.accuracyClass || device.capacity || device.nominalVoltage || device.capacitance || device.transformationRatio) && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <h3 className="text-accent font-semibold whitespace-nowrap">Thông số kỹ thuật</h3>
                                                    <div className="flex-1 border-b border-dashed border-accent mr-1" />
                                                </div>
                                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                                    <Table>
                                                        <TableBody>
                                                            {!!device.productionYear && (
                                                                <TableRow>
                                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">Năm sản xuất</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="neutral">
                                                                            {device.productionYear}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                            {!!(device.deviceModel || (device as any).model) && (
                                                                <TableRow>
                                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">Kiểu máy</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="neutral">
                                                                            {device.deviceModel || (device as any).model}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                            {!!device.accuracyClass && (
                                                                <TableRow>
                                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">Cấp chính xác</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="neutral">
                                                                            {device.accuracyClass}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                            {!!device.capacity && (
                                                                <TableRow>
                                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">Công suất (VA)</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="neutral">
                                                                            {device.capacity}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                            {!!device.nominalVoltage && (
                                                                <TableRow>
                                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">Điện áp định mức (kV)</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="neutral">
                                                                            {device.nominalVoltage}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                            {!!device.capacitance && (
                                                                <TableRow>
                                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">Điện dung</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="neutral">
                                                                            {device.capacitance}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                            {!!device.transformationRatio && (
                                                                <TableRow>
                                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">Tỷ số biến</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="neutral">
                                                                            {device.transformationRatio}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </Card>
                                            </div>
                                        )}
                                        <div className="col-12 space-y-4">
                                            {renderSerialGrid()}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="images" className="mt-0 outline-none">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-neutral-300 font-semibold">Hình ảnh thiết bị</h3>
                                            {!isPartner && (
                                                <Button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadMutation.isPending}
                                                >
                                                    {uploadMutation.isPending ? (
                                                        <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                                                    ) : (
                                                        <Icon path={mdiPlus} size={0.8} />
                                                    )}
                                                    Thêm hình ảnh
                                                </Button>
                                            )}
                                        </div>

                                        {!device?.images || device.images.length === 0 ? (
                                            <EmptyState icon={mdiImageOutline} message="Chưa có hình ảnh nào được tải lên." />
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                                                {device.images.map((url: string, index: number) => (
                                                    <div
                                                        key={url}
                                                        className="group relative aspect-square rounded-lg border border-darkBorderV1 overflow-hidden"
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`Device image ${index + 1}`}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            {!isPartner && (
                                                                <button
                                                                    className="size-10 flex items-center justify-center rounded-full bg-black/90 text-neutral-300 border-none"
                                                                    onClick={() => handleDeleteImage(url)}
                                                                >
                                                                    <Icon path={mdiTrashCanOutline} size={0.8} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="history" className="mt-0 outline-none">
                                    <div className="space-y-2">
                                        <h3 className="text-neutral-300 font-semibold">
                                            Lịch sử các lần thí nghiệm
                                        </h3>

                                        {isJobsLoading ? (
                                            <div className="py-10 flex flex-col items-center justify-center gap-2 text-neutral-400 italic">
                                                <Icon path={mdiLoading} size={1} className="animate-spin" />
                                                <p>Đang tải lịch sử...</p>
                                            </div>
                                        ) : testJobs.length === 0 ? (
                                            <EmptyState icon={mdiHistory} message="Không có lịch sử thí nghiệm cho thiết bị này." />
                                        ) : (
                                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="text-center">STT</TableHead>
                                                            <TableHead>Ngày thí nghiệm</TableHead>
                                                            <TableHead>Số biên bản</TableHead>
                                                            <TableHead>Đơn vị quản lý</TableHead>
                                                            <TableHead>Loại thí nghiệm</TableHead>
                                                            <TableHead>Lý do thí nghiệm</TableHead>
                                                            <TableHead>Kết quả</TableHead>
                                                            <TableHead className="text-center">Thao tác</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {testJobs.map((job: any, index: number) => (
                                                            <TableRow key={job._id} className="cursor-pointer hover:bg-accent/5 transition-colors">
                                                                <TableCell className="text-center">
                                                                    {index + 1}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="neutral">{formatDate(job.testDate)}</Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="green">{job.reportNumber || ""}</Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="text-sm text-accent uppercase truncate max-w-[250px] mt-1">
                                                                        {job.projectName}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="neutral">{job.testType || "Định kỳ"}</Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {job.purpose || "Không có lý do"}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Badge variant={job.status === "Đạt" ? "green" : "red"}>
                                                                        {job.status || "Đạt"}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <div className="flex justify-end space-x-2">
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button size="icon"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setSelectedJobId(job._id);
                                                                                        setIsWorkDetailsOpen(true);
                                                                                    }}>
                                                                                    <Icon path={mdiEye} size={0.8} />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Chi tiết biên bản thí nghiệm
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button size="icon" asChild>
                                                                                    <Link href={`/laboratory-work/preview/${job._id}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                                                                                        <Icon path={mdiFilePdfBox} size={0.8} />
                                                                                    </Link>
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Xem biên bản</TooltipContent>
                                                                        </Tooltip>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Card>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="records" className="mt-0 outline-none">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-neutral-300 font-semibold">Hồ sơ kiểm định & Pháp lý</h3>
                                            <Button
                                                onClick={() => fileInputRecordsRef.current?.click()}
                                                disabled={uploadPdfMutation.isPending}
                                            >
                                                {uploadPdfMutation.isPending ? (
                                                    <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                                                ) : (
                                                    <Icon path={mdiPlus} size={0.8} />
                                                )}
                                                Thêm hồ sơ
                                            </Button>
                                        </div>

                                        {!device?.records || device.records.length === 0 ? (
                                            <EmptyState icon={mdiFileDocumentOutline} message="Chưa có hồ sơ kiểm định nào." />
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                {device.records.map((record: ITestingDeviceRecord) => (
                                                    <FileRecordCard
                                                        key={record._id || record.fileUrl}
                                                        fileName={record.fileName}
                                                        fileUrl={record.fileUrl}
                                                        fileType={record.fileType}
                                                        fileSize={record.fileSize}
                                                        createdAt={record.createdAt}
                                                        onDelete={() => handleDeleteRecord(record)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="technical" className="mt-0 outline-none">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-neutral-300 font-semibold">Tài liệu kỹ thuật</h3>
                                            <Button
                                                onClick={() => fileInputTechnicalRef.current?.click()}
                                                disabled={uploadPdfMutation.isPending}
                                            >
                                                {uploadPdfMutation.isPending ? (
                                                    <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                                                ) : (
                                                    <Icon path={mdiPlus} size={0.8} />
                                                )}
                                                Thêm tài liệu
                                            </Button>
                                        </div>

                                        {!device?.technicalDocuments || device.technicalDocuments.length === 0 ? (
                                            <EmptyState icon={mdiFileDocumentOutline} message="Chưa có tài liệu kỹ thuật nào." />
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                {device.technicalDocuments.map((doc: ITestingDeviceRecord) => (
                                                    <FileRecordCard
                                                        key={doc._id || doc.fileUrl}
                                                        fileName={doc.fileName}
                                                        fileUrl={doc.fileUrl}
                                                        fileType={doc.fileType}
                                                        fileSize={doc.fileSize}
                                                        createdAt={doc.createdAt}
                                                        onDelete={() => handleDeleteTechnical(doc)}
                                                        showDelete={!isPartner}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="chart" className="mt-0 outline-none">
                                    <EmptyState icon={mdiChartLine} message="Không có dữ liệu số liệu hoặc cấu hình vẽ biểu đồ." />
                                </TabsContent>
                            </>
                        ) : (
                            <div className="py-20 text-center text-neutral-400 italic">
                                Không tìm thấy dữ liệu thiết bị.
                            </div>
                        )}
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    {!isPartner && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAddJobOpen(true);
                                    }}
                                >
                                    <Icon path={mdiFlask} size={0.8} />
                                    Thêm công việc Thí nghiệm
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Thêm công việc thí nghiệm</TooltipContent>
                        </Tooltip>
                    )}
                    {!isPartner && onEdit && device && (
                        <Button
                            onClick={() => {
                                onClose();
                                onEdit(device);
                            }}
                        >
                            <Icon path={mdiSquareEditOutline} size={0.8} />
                            Cập nhật
                        </Button>
                    )}
                </DialogFooter>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleUploadImage}
                />
                <input
                    type="file"
                    ref={fileInputRecordsRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleUploadRecord}
                />
                <input
                    type="file"
                    ref={fileInputTechnicalRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleUploadTechnical}
                />

                <LaboratoryWorkDetailsDialog
                    isOpen={isWorkDetailsOpen}
                    onClose={() => setIsWorkDetailsOpen(false)}
                    jobId={selectedJobId}
                />

                <AddJobDialog
                    isOpen={isAddJobOpen}
                    onClose={() => setIsAddJobOpen(false)}
                    device={device}
                />
            </DialogContent>
        </Dialog>
    );
};
