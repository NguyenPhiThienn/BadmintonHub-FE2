"use client";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMe } from "@/hooks/useAuth";
import { useBays } from "@/hooks/useBays";
import { useCreateTestJob, useDeleteTestJob, useGroupedTestJobs, useTestJobDetails, useTestJobs, useTestingDevicePartners } from "@/hooks/useTesting";
import { useVoltageLevels } from "@/hooks/useVoltageLevels";
import { ITestJob } from "@/interface/testing";
import { mdiMagnify, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { GroupedLaboratoryWork } from "./GroupedLaboratoryWork";
import { LaboratoryWorkDetailsDialog } from "./LaboratoryWorkDetailsDialog";
import { LaboratoryWorkDialog } from "./LaboratoryWorkDialog";

export default function LaboratoryWorkPage() {
    const { data: profileResponse } = useMe();
    const profile = profileResponse?.data;
    const isPartner = profile?.role === "partner";
    const currentPartnerId = profile?.id;

    const [searchQuery, setSearchQuery] = useState("");
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ITestJob | null>(null);
    const [selectedCopyJob, setSelectedCopyJob] = useState<ITestJob | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<ITestJob | null>(null);
    const [editingDevice, setEditingDevice] = useState<any>(null);

    // State for lazy loading copy data
    const [fetchingCopyId, setFetchingCopyId] = useState<string | null>(null);
    const { data: copyFetchResponse, isFetching: isFetchingCopy } = useTestJobDetails(fetchingCopyId || "");

    // Filters
    const [partnerFilter, setPartnerFilter] = useState<string>("all");
    const [voltageLevelFilter, setVoltageLevelFilter] = useState<string>("all");
    const [bayFilter, setBayFilter] = useState<string>("all");
    const [yearFilter, setYearFilter] = useState<string>("all");
    const [testTypeFilter, setTestTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [partnerSearch, setPartnerSearch] = useState("");

    // Helpers
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => String(currentYear - i));
    const testTypes = ["Định kỳ", "Sau lắp đặt", "Đột xuất", "Tăng cường"];

    // Fetch lists for filters
    const { data: partnersResponse } = useTestingDevicePartners({ limit: 1000 });
    const { data: voltageLevelsResponse } = useVoltageLevels(
        partnerFilter !== "all" ? { partnerId: partnerFilter } : {}
    );
    const { data: baysResponse } = useBays(
        voltageLevelFilter !== "all" ? { voltageLevelId: voltageLevelFilter } : {}
    );

    const partners = Array.isArray(partnersResponse?.data) ? partnersResponse.data : [];
    const filteredPartners = partners.filter((p: any) =>
        p.partnerName?.toLowerCase().includes(partnerSearch.toLowerCase())
    );

    const voltageLevels = Array.isArray(voltageLevelsResponse?.data?.voltageLevels)
        ? voltageLevelsResponse.data.voltageLevels
        : (Array.isArray(voltageLevelsResponse?.data) ? voltageLevelsResponse.data : []);

    const bays = Array.isArray(baysResponse?.data?.bays)
        ? baysResponse.data.bays
        : (Array.isArray(baysResponse?.data) ? baysResponse.data : []);

    const {
        data: jobsResponse,
        isLoading,
        isFetching,
        refetch,
    } = useTestJobs({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        deviceId: undefined, // Add if needed
        status: statusFilter !== "all" ? statusFilter : undefined,
        partnerId: partnerFilter !== "all" ? partnerFilter : undefined,
        voltageLevelId: voltageLevelFilter !== "all" ? voltageLevelFilter : undefined,
        bayId: bayFilter !== "all" ? bayFilter : undefined,
        year: yearFilter !== "all" ? yearFilter : undefined,
        testType: testTypeFilter !== "all" ? testTypeFilter : undefined,
    });

    const {
        data: groupedResponse,
        isLoading: isGroupedLoading,
        isFetching: isGroupedFetching,
    } = useGroupedTestJobs({
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        partnerId: partnerFilter !== "all" ? partnerFilter : undefined,
        voltageLevelId: voltageLevelFilter !== "all" ? voltageLevelFilter : undefined,
        bayId: bayFilter !== "all" ? bayFilter : undefined,
        year: yearFilter !== "all" ? yearFilter : undefined,
        testType: testTypeFilter !== "all" ? testTypeFilter : undefined,
    });

    const handleRefresh = () => {
        setSearchQuery("");
        setPartnerFilter("all");
        setVoltageLevelFilter("all");
        setBayFilter("all");
        setYearFilter("all");
        setTestTypeFilter("all");
        setStatusFilter("all");
        setCurrentPage(1);
        refetch();
    };

    // Tự động set partnerFilter nếu là partner
    useEffect(() => {
        if (isPartner && currentPartnerId) {
            setPartnerFilter(currentPartnerId);
        }
    }, [isPartner, currentPartnerId]);

    // Handle lazy loaded copy data
    useEffect(() => {
        if (fetchingCopyId && copyFetchResponse?.data) {
            setSelectedCopyJob(copyFetchResponse.data);
            setIsCopyDialogOpen(true);
            setFetchingCopyId(null);
        }
    }, [copyFetchResponse, fetchingCopyId]);

    const { mutate: deleteJobMutation, isPending: isDeleting } = useDeleteTestJob();
    const { mutate: createJobMutation, isPending: isCreating } = useCreateTestJob();

    const handleViewDetails = (item: ITestJob) => {
        setSelectedJobId(item._id);
        setIsDetailsDialogOpen(true);
    };

    const handleEdit = (item: ITestJob) => {
        setEditingJob(item);
        setEditingDevice(item.deviceId);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (item: ITestJob) => {
        setSelectedItem(item);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        return new Promise((resolve, reject) => {
            deleteJobMutation(selectedItem._id, {
                onSuccess: () => {
                    setSelectedItem(null);
                    resolve(true);
                },
                onError: (error) => {
                    reject(error);
                }
            });
        });
    };

    const confirmCopy = () => {
        if (!selectedCopyJob) return;

        // Prepare payload according to ICreateTestJobRequest
        const payload = {
            deviceId: typeof selectedCopyJob.deviceId === 'object' ? (selectedCopyJob.deviceId as any)._id : selectedCopyJob.deviceId,
            projectName: selectedCopyJob.projectName,
            site: selectedCopyJob.site,
            reportNumber: selectedCopyJob.reportNumber,
            testDate: new Date().toISOString(),
            testType: selectedCopyJob.testType,
            reinforcementContent: selectedCopyJob.reinforcementContent,
            temperature: selectedCopyJob.temperature,
            humidity: selectedCopyJob.humidity,
            testerName: selectedCopyJob.testerName,
            approverName: selectedCopyJob.approverName,
            directorName: selectedCopyJob.directorName,
            status: selectedCopyJob.status || "Đạt",
            conclusion: selectedCopyJob.conclusion,
            failReason: selectedCopyJob.failReason,
            notes: selectedCopyJob.notes,
            purpose: selectedCopyJob.purpose,
            testingTools: selectedCopyJob.testingTools,
            testResults: selectedCopyJob.testResults,
        };

        createJobMutation(payload, {
            onSuccess: () => {
                setIsCopyDialogOpen(false);
                setSelectedCopyJob(null);
                refetch();
            },
        });
    };

    const jobs = Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];

    return (
        <TooltipProvider>
            <div className="space-y-4 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Công việc thí nghiệm</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col gap-3 md:gap-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="relative flex-1 min-w-[280px]">
                                    <Input
                                        placeholder="Tìm theo dự án, số BB, người thí nghiệm..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onClear={() => setSearchQuery("")}
                                        className="pl-8 py-2 w-full"
                                    />
                                    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                </div>
                                <Button
                                    onClick={handleRefresh}
                                    disabled={isFetching}
                                    variant="ghost"
                                    className="hover:bg-accent/10"
                                >
                                    <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                    Reset bộ lọc
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                                <Select
                                    value={partnerFilter}
                                    onValueChange={(value) => {
                                        setPartnerFilter(value);
                                        setVoltageLevelFilter("all");
                                        setBayFilter("all");
                                    }}
                                    onOpenChange={(open) => !open && setPartnerSearch("")}
                                    disabled={isPartner}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Công ty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {!isPartner && (
                                            <>
                                                <div className="sticky top-0 z-10 bg-darkCardV1 p-2 border-b border-darkBorderV1 mb-1">
                                                    <div className="relative">
                                                        <Icon path={mdiMagnify} size={0.8} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                        <Input
                                                            placeholder="Nhập từ khóa tìm kiếm công ty..."
                                                            value={partnerSearch}
                                                            onChange={(e) => setPartnerSearch(e.target.value)}
                                                            onClear={() => setPartnerSearch("")}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                            autoFocus
                                                            onBlur={(e) => e.target.focus()}
                                                            className="pl-8 py-2 w-full bg-transparent"
                                                        />
                                                    </div>
                                                </div>
                                                <SelectItem value="all">Tất cả công ty</SelectItem>
                                            </>
                                        )}
                                        {filteredPartners.length > 0 ? (
                                            filteredPartners.map((p: any) => (
                                                <SelectItem key={p._id} value={p._id}>{p.partnerName}</SelectItem>
                                            ))
                                        ) : (
                                            partnerSearch && <div className="py-4 text-center text-sm text-neutral-400 italic">Không tìm thấy kết quả</div>
                                        )}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={voltageLevelFilter}
                                    onValueChange={(value) => {
                                        setVoltageLevelFilter(value);
                                        setBayFilter("all");
                                    }}
                                    disabled={partnerFilter === "all"}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Cấp điện áp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả cấp điện áp</SelectItem>
                                        {voltageLevels.map((lvl: any) => (
                                            <SelectItem key={lvl._id} value={lvl._id}>{lvl.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={bayFilter}
                                    onValueChange={setBayFilter}
                                    disabled={voltageLevelFilter === "all"}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Ngăn lộ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả ngăn lộ</SelectItem>
                                        {bays.map((b: any) => (
                                            <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={yearFilter} onValueChange={setYearFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Năm thực hiện" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả các năm</SelectItem>
                                        {years.map(y => (
                                            <SelectItem key={y} value={y}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Loại thí nghiệm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả loại TN</SelectItem>
                                        {testTypes.map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả kết quả</SelectItem>
                                        <SelectItem value="Đạt">ĐẠT</SelectItem>
                                        <SelectItem value="Không đạt">KHÔNG ĐẠT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <GroupedLaboratoryWork
                            data={groupedResponse?.data}
                            isLoading={isGroupedLoading}
                            isPartner={isPartner}
                            onViewDetails={(jobPartial) => {
                                const fullJob = jobs.find((j: ITestJob) => j._id === jobPartial._id);
                                if (fullJob) handleViewDetails(fullJob);
                                else {
                                    setSelectedJobId(jobPartial._id);
                                    setIsDetailsDialogOpen(true);
                                }
                            }}
                            onEdit={(jobPartial) => {
                                const fullJob = jobs.find((j: ITestJob) => j._id === jobPartial._id);
                                if (fullJob) handleEdit(fullJob);
                            }}
                            onDelete={(jobPartial) => {
                                const fullJob = jobs.find((j: ITestJob) => j._id === jobPartial._id);
                                if (fullJob) handleDelete(fullJob);
                            }}
                            onCopy={(jobPartial) => {
                                setFetchingCopyId(jobPartial._id);
                                toast.info("Đang tải dữ liệu biên bản...", { autoClose: 1000 });
                            }}
                        />
                    </div>
                </motion.div>

                <DeleteDialog
                    isOpen={isDeleteDialogOpen}
                    isDeleting={isDeleting}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title={`Xóa kết quả thí nghiệm?`}
                    description="Xác nhận xóa kết quả thí nghiệm này? Dữ liệu sẽ không thể khôi phục."
                    confirmText="Xóa dữ liệu"
                    successMessage="Xóa công việc thí nghiệm thành công"
                    errorMessage="Xóa công việc thí nghiệm thất bại"
                />

                <ConfirmDialog
                    isOpen={isCopyDialogOpen}
                    onClose={() => setIsCopyDialogOpen(false)}
                    onConfirm={confirmCopy}
                    isPending={isCreating}
                    title="Sao chép và tạo mới biên bản"
                    description={`Bạn có chắc chắn muốn sao chép toàn bộ dữ liệu của biên bản "${typeof selectedCopyJob?.deviceId === 'object' ? (selectedCopyJob.deviceId as any).operatingName : 'này'}" sang một bản ghi mới với ngày thực hiện là hôm nay?`}
                    confirmText="Xác nhận sao chép"
                    cancelText="Hủy"
                />

                <LaboratoryWorkDetailsDialog
                    isOpen={isDetailsDialogOpen}
                    onClose={() => {
                        setIsDetailsDialogOpen(false);
                        setSelectedJobId(null);
                    }}
                    jobId={selectedJobId}
                />

                <LaboratoryWorkDialog
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setEditingJob(null);
                        setEditingDevice(null);
                    }}
                    device={editingDevice}
                    job={editingJob}
                />
            </div>
        </TooltipProvider>
    );
}
