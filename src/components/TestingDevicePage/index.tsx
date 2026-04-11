"use client";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useResponsive } from "@/hooks/use-mobile";
import { useMe } from "@/hooks/useAuth";
import { useBays } from "@/hooks/useBays";
import { useDeleteTestingDevice, useDeviceTypes, useTestingDevicePartners, useTestingDevices } from "@/hooks/useTesting";
import { useVoltageLevels } from "@/hooks/useVoltageLevels";
import { ITestingDevice } from "@/interface/testing";
import { mdiMagnify, mdiPlus, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AddJobDialog } from "./AddJobDialog";
import { TestingDeviceDetailsDialog } from "./TestingDeviceDetailsDialog";
import { TestingDeviceDialog } from "./TestingDeviceDialog";
import { TestingDeviceTable } from "./TestingDeviceTable";

export default function TestingDevicePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddJobDialogOpen, setIsAddJobDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ITestingDevice | null>(null);
    const [selectedDeviceForJob, setSelectedDeviceForJob] = useState<ITestingDevice | null>(null);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [deviceTypeSearch, setDeviceTypeSearch] = useState("");

    // Filters
    const [partnerFilter, setPartnerFilter] = useState<string>("all");
    const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("all");
    const [voltageLevelFilter, setVoltageLevelFilter] = useState<string>("all");
    const [bayFilter, setBayFilter] = useState<string>("all");
    const [partnerSearch, setPartnerSearch] = useState("");

    const { isMobile, isTablet } = useResponsive();
    const { data: profileResponse } = useMe();
    const profile = profileResponse?.data;
    const isPartner = profile?.role === "partner";
    const currentPartnerId = profile?.id;

    // Tự động set partnerFilter nếu là partner
    useEffect(() => {
        if (isPartner && currentPartnerId) {
            setPartnerFilter(currentPartnerId);
        }
    }, [isPartner, currentPartnerId]);

    // Khi là partner, cố định partnerFilter là ID của profile
    const effectivePartnerId = isPartner ? currentPartnerId : (partnerFilter !== "all" ? partnerFilter : undefined);

    // Fetch lists for filters
    const { data: partnersResponse } = useTestingDevicePartners({ limit: 1000 });
    const { data: deviceTypesResponse } = useDeviceTypes();

    const fetchVoltageLevelsByPartner = !!effectivePartnerId;
    const { data: voltageLevelsResponse } = useVoltageLevels(
        fetchVoltageLevelsByPartner ? { partnerId: effectivePartnerId } : {}
    );

    const fetchBaysByVoltageLevel = voltageLevelFilter !== "all";
    const { data: baysResponse } = useBays(
        fetchBaysByVoltageLevel ? { voltageLevelId: voltageLevelFilter } : {}
    );

    const partners = Array.isArray(partnersResponse?.data) ? partnersResponse.data : [];
    const filteredPartners = partners.filter((p: any) =>
        p.partnerName?.toLowerCase().includes(partnerSearch.toLowerCase())
    );
    const deviceTypes = Array.isArray(deviceTypesResponse?.data) ? deviceTypesResponse.data : [];

    const voltageLevels = Array.isArray(voltageLevelsResponse?.data?.voltageLevels)
        ? voltageLevelsResponse.data.voltageLevels
        : (Array.isArray(voltageLevelsResponse?.data) ? voltageLevelsResponse.data : []);

    const bays = Array.isArray(baysResponse?.data?.bays)
        ? baysResponse.data.bays
        : (Array.isArray(baysResponse?.data) ? baysResponse.data : []);

    const filteredDeviceTypes = deviceTypes.filter((dt: any) =>
        dt.name?.toLowerCase().includes(deviceTypeSearch.toLowerCase())
    );

    const {
        data: devicesResponse,
        isLoading,
        isFetching,
        refetch,
    } = useTestingDevices({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        partnerId: effectivePartnerId,
        deviceTypeId: deviceTypeFilter !== "all" ? deviceTypeFilter : undefined,
        voltageLevelId: voltageLevelFilter !== "all" ? voltageLevelFilter : undefined,
        bayId: bayFilter !== "all" ? bayFilter : undefined,
    });

    const handleRefresh = () => {
        setSearchQuery("");
        setPartnerFilter("all");
        setDeviceTypeFilter("all");
        setVoltageLevelFilter("all");
        setBayFilter("all");
        setCurrentPage(1);
        refetch();
    };

    const { mutate: deleteDeviceMutation, isPending: isDeleting } = useDeleteTestingDevice();

    const handleViewDetails = (item: ITestingDevice) => {
        setSelectedDeviceId(item._id);
        setIsDetailsDialogOpen(true);
    };

    const handleEdit = (item: ITestingDevice) => {
        setSelectedItem(item);
        setIsEditDialogOpen(true);
    };

    const handleAddJob = (item: ITestingDevice) => {
        setSelectedDeviceForJob(item);
        setIsAddJobDialogOpen(true);
    };

    const handleDelete = (item: ITestingDevice) => {
        setSelectedItem(item);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        return new Promise((resolve, reject) => {
            deleteDeviceMutation(selectedItem._id, {
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const devices = Array.isArray(devicesResponse?.data) ? devicesResponse.data : [];
    const pagination = devicesResponse?.pagination;
    const totalItems = pagination?.total || 0;
    const totalPages = pagination?.total_pages || 1;

    return (
        <TooltipProvider>
            <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Quản lý thiết bị thí nghiệm</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col gap-3 md:gap-4">
                        {/* Dòng 1: Search + Thêm thiết bị */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Input
                                    placeholder="Tìm kiếm thiết bị (tên, mã)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onClear={() => setSearchQuery("")}
                                    className="pl-8 py-2 w-full"
                                />
                                <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                            </div>

                            <Button
                                onClick={() => {
                                    setSelectedItem(null);
                                    setIsEditDialogOpen(true);
                                }}
                            >
                                <Icon path={mdiPlus} size={0.8} />
                                Thêm thiết bị
                            </Button>
                        </div>

                        {/* Dòng 2: Các bộ lọc */}
                        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <Select value={deviceTypeFilter === "all" ? undefined : deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại thiết bị" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div
                                            className="sticky top-0 z-10 bg-darkCardV1 p-2 border-b border-darkBorderV1 mb-1"
                                            onKeyDown={(e) => e.stopPropagation()}
                                            onKeyDownCapture={(e) => e.stopPropagation()}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            onKeyUp={(e) => e.stopPropagation()}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="relative">
                                                <Icon path={mdiMagnify} size={0.8} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                <Input
                                                    placeholder="Nhập từ khóa tìm kiếm loại thiết bị..."
                                                    value={deviceTypeSearch}
                                                    onChange={(e) => setDeviceTypeSearch(e.target.value)}
                                                    onClear={() => setDeviceTypeSearch("")}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    onKeyDownCapture={(e) => e.stopPropagation()}
                                                    autoFocus
                                                    onBlur={(e) => e.target.focus()}
                                                    className="pl-8 py-2 w-full bg-transparent"
                                                />
                                            </div>
                                        </div>
                                        {!deviceTypeSearch && (
                                            <SelectItem value="all">Tất cả loại thiết bị</SelectItem>
                                        )}
                                        {filteredDeviceTypes.length > 0 ? (
                                            filteredDeviceTypes.map((dt: any) => (
                                                <SelectItem key={dt._id} value={dt._id}>{dt.name}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="py-4 text-center text-sm text-neutral-400 italic">
                                                Không tìm thấy kết quả
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>

                                {!isPartner && (
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
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Công ty" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                            {filteredPartners.length > 0 ? (
                                                filteredPartners.map((p: any) => (
                                                    <SelectItem key={p._id} value={p._id}>{p.partnerName}</SelectItem>
                                                ))
                                            ) : (
                                                partnerSearch && <div className="py-4 text-center text-sm text-neutral-400 italic">Không tìm thấy kết quả</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}

                                <Select
                                    value={voltageLevelFilter}
                                    onValueChange={(value) => {
                                        setVoltageLevelFilter(value);
                                        setBayFilter("all");
                                    }}
                                    disabled={!effectivePartnerId}
                                >
                                    <SelectTrigger className="w-full">
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
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Ngăn lộ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả ngăn lộ</SelectItem>
                                        {bays.map((b: any) => (
                                            <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

                        <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent mt-1 md:mt-0">
                            <TestingDeviceTable
                                devices={devices}
                                isLoading={isLoading || isFetching}
                                isPartner={isPartner}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onViewDetails={handleViewDetails}
                                onAddJob={handleAddJob}
                                currentPage={currentPage}
                                pageSize={pageSize}
                            />
                        </Card>

                        {totalItems > pageSize && (
                            <div className="flex items-center justify-center mt-2">
                                <Pagination
                                    page={currentPage}
                                    pageSize={pageSize}
                                    total={totalItems}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                </motion.div>

                <DeleteDialog
                    isOpen={isDeleteDialogOpen}
                    isDeleting={isDeleting}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title={`Xóa thiết bị: ${selectedItem?.operatingName || ""}`}
                    description="Bạn có chắc chắn muốn xóa thiết bị này không? Hành động này không thể hoàn tác."
                    confirmText="Xóa thiết bị"
                    successMessage="Xóa thiết bị thành công"
                    errorMessage="Xóa thiết bị thất bại"
                />

                <TestingDeviceDetailsDialog
                    isOpen={isDetailsDialogOpen}
                    onClose={() => {
                        setIsDetailsDialogOpen(false);
                        setSelectedDeviceId(null);
                    }}
                    deviceId={selectedDeviceId}
                    onEdit={(device) => {
                        setSelectedItem(device);
                        setIsEditDialogOpen(true);
                    }}
                />

                <TestingDeviceDialog
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setSelectedItem(null);
                    }}
                    device={selectedItem}
                />

                <AddJobDialog
                    isOpen={isAddJobDialogOpen}
                    onClose={() => {
                        setIsAddJobDialogOpen(false);
                        setSelectedDeviceForJob(null);
                    }}
                    device={selectedDeviceForJob}
                />
            </div>
        </TooltipProvider>
    );
}
