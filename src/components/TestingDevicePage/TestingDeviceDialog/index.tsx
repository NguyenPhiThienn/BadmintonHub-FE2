"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuantityInput } from "@/components/ui/quantity-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMe } from "@/hooks/useAuth";
import { useBaysByVoltageLevel } from "@/hooks/useBays";
import { usePartners } from "@/hooks/usePartners";
import { useCreateTestingDevice, useDeviceTypes, useUpdateTestingDevice } from "@/hooks/useTesting";
import { useVoltageLevelsByPartner } from "@/hooks/useVoltageLevels";
import { ITestingDevice } from "@/interface/testing";
import { TestingDeviceFormData, useTestingDeviceFormStore } from "@/stores/useTestingDeviceFormStore";
import {
    mdiClose,
    mdiContentSave,
    mdiLoading,
    mdiMagnify,
    mdiPlus,
    mdiRefresh,
    mdiSquareEditOutline,
    mdiToolboxOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface TestingDeviceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    device?: ITestingDevice | null;
}

export const TestingDeviceDialog = ({ isOpen, onClose, device }: TestingDeviceDialogProps) => {
    const {
        formData,
        serialRows,
        serialCols,
        serialData,
        setFormData,
        setSerialRows,
        setSerialCols,
        setSerialData,
        resetFormData
    } = useTestingDeviceFormStore();

    const [partnerSearch, setPartnerSearch] = useState("");
    const [deviceTypeSearch, setDeviceTypeSearch] = useState("");
    const { data: profileResponse } = useMe();
    const profile = profileResponse?.data;
    const isPartner = profile?.role === "partner";
    const currentPartnerId = profile?.id;

    // --- Fetching Data ---
    const { data: deviceTypesResponse } = useDeviceTypes();
    const { data: partnersResponse } = usePartners({ limit: 1000 });

    const selectedPartnerId = formData.partnerId;
    const selectedVoltageLevelId = formData.voltageLevelId;

    const { data: voltageLevelsResponse } = useVoltageLevelsByPartner(selectedPartnerId);
    const { data: baysResponse } = useBaysByVoltageLevel(selectedVoltageLevelId);

    const deviceTypes = deviceTypesResponse?.data || [];
    const partners = Array.isArray(partnersResponse?.data?.partners)
        ? partnersResponse.data.partners
        : (Array.isArray(partnersResponse?.data) ? partnersResponse.data : []);
    const voltageLevels = Array.isArray(voltageLevelsResponse?.data?.voltageLevels)
        ? voltageLevelsResponse.data.voltageLevels
        : (Array.isArray(voltageLevelsResponse?.data) ? voltageLevelsResponse.data : []);

    const bays = Array.isArray(baysResponse?.data?.bays)
        ? baysResponse.data.bays
        : (Array.isArray(baysResponse?.data) ? baysResponse.data : []);

    const selectedDeviceType = deviceTypes.find((dt: any) => dt._id === formData.deviceTypeId);
    const deviceTypeName = selectedDeviceType?.name || "";

    const filteredPartners = partners.filter((p: any) =>
        p.partnerName?.toLowerCase().includes(partnerSearch.toLowerCase())
    );

    const filteredDeviceTypes = deviceTypes.filter((dt: any) =>
        dt.name?.toLowerCase().includes(deviceTypeSearch.toLowerCase())
    );

    // --- Sync Form When Open/Edit ---
    useEffect(() => {
        if (isOpen) {
            if (device) {
                const initData = {
                    operatingName: device.operatingName,
                    designatedName: device.designatedName || "",
                    equipmentCode: device.equipmentCode,
                    site: (device as any).site || "",
                    deviceTypeId: typeof device.deviceTypeId === "string" ? device.deviceTypeId : (device.deviceTypeId as any)?._id || "",
                    partnerId: typeof device.partnerId === "string" ? device.partnerId : (device.partnerId as any)?._id || "",
                    voltageLevelId: typeof device.voltageLevelId === "string" ? device.voltageLevelId : (device.voltageLevelId as any)?._id || "",
                    bayId: typeof device.bayId === "string" ? device.bayId : (device.bayId as any)?._id || "",
                    manufacturer: device.manufacturer || "",
                    testCycle: device.testCycle,
                    warrantyMonths: device.warrantyMonths || 12,
                    commissioningDate: device.commissioningDate ? new Date(device.commissioningDate).toISOString() : undefined,
                    lastTestDate: device.lastTestDate ? new Date(device.lastTestDate).toISOString() : undefined,
                    serialJson: device.serialJson || "",
                    productionYear: (device as any).productionYear,
                    deviceModel: (device as any).deviceModel || (device as any).model || "",
                    accuracyClass: (device as any).accuracyClass || "",
                    capacity: (device as any).capacity || "",
                    nominalVoltage: (device as any).nominalVoltage,
                    capacitance: (device as any).capacitance || "",
                    transformationRatio: (device as any).transformationRatio || "",
                    nominalCurrent: (device as any).nominalCurrent,
                    shortCircuitCurrent: (device as any).shortCircuitCurrent,
                    nominalDischargeCurrent: (device as any).nominalDischargeCurrent || "",
                    continuousOperatingVoltage: (device as any).continuousOperatingVoltage || "",
                    leakageCurrentScale: (device as any).leakageCurrentScale || "",
                    vectorGroup: (device as any).vectorGroup || "",
                    protectionObject: (device as any).protectionObject || "",
                    testLocation: (device as any).testLocation || "",
                    settingOrder: (device as any).settingOrder || "",
                    lineVtRatio: (device as any).lineVtRatio || "",
                    busVtRatio: (device as any).busVtRatio || "",
                    ctRatio1: (device as any).ctRatio1 || "",
                    ctRatio2: (device as any).ctRatio2 || "",
                    ctRatio3: (device as any).ctRatio3 || "",
                    hvWinding: (device as any).hvWinding || "",
                    mvWinding: (device as any).mvWinding || "",
                    lvWinding: (device as any).lvWinding || "",
                    cableSize: (device as any).cableSize || "",
                    cableType: (device as any).cableType || "",
                    quantity: (device as any).quantity,
                    model: undefined, // Explicitly clear old field
                };
                setFormData(initData);

                if (device.serialJson) {
                    try {
                        const parsed = JSON.parse(device.serialJson);
                        const rows = parsed.rows || 1;
                        const cols = parsed.cols || 1;
                        let data = parsed.data || {};
                        const keys = Object.keys(data);
                        const isInverted = keys.some(k => {
                            const m = k.match(/serial_(\d+)_(\d+)/);
                            if (m) {
                                const r = parseInt(m[1]);
                                const c = parseInt(m[2]);
                                // If first index > rows OR second index > cols (but fits if swapped), it might be inverted
                                return (r > rows && r <= cols) || (c > cols && c <= rows);
                            }
                            return false;
                        }) || (cols === 1 && keys.some(k => k.startsWith("serial_1_") && k !== "serial_1_1"));

                        if (isInverted) {
                            const migratedData: Record<string, string> = {};
                            keys.forEach(k => {
                                const m = k.match(/serial_(\d+)_(\d+)/);
                                if (m) {
                                    const c = parseInt(m[1]);
                                    const r = parseInt(m[2]);
                                    migratedData[`serial_${r}_${c}`] = data[k];
                                } else {
                                    migratedData[k] = data[k];
                                }
                            });
                            data = migratedData;
                        }

                        setSerialRows(rows);
                        setSerialCols(cols);
                        setSerialData(data);
                    } catch (e) {
                        console.error("Lỗi parse Serial JSON", e);
                    }
                }
            }
        }
    }, [isOpen, device]);

    // Tự động set partnerId nếu là partner và thêm mới
    useEffect(() => {
        if (isOpen && isPartner && currentPartnerId && !device) {
            setFormData({ partnerId: currentPartnerId });
        }
    }, [isOpen, isPartner, currentPartnerId, device]);

    useEffect(() => {
        if (isOpen && selectedPartnerId && voltageLevels.length > 0) {
            const currentVl = formData.voltageLevelId;
            const isValid = voltageLevels.some((vl: any) => vl._id === currentVl);
            if (currentVl && !isValid) {
                setFormData({ voltageLevelId: "", bayId: "" });
            }
        }
    }, [selectedPartnerId, voltageLevels, isOpen]);
    useEffect(() => {
        if (isOpen && selectedVoltageLevelId && bays.length > 0) {
            const currentBay = formData.bayId;
            const isValid = bays.some((b: any) => b._id === currentBay);
            if (currentBay && !isValid) {
                setFormData({ bayId: "" });
            }
        }
    }, [selectedVoltageLevelId, bays, isOpen]);

    // --- Serial Grid Helpers ---
    const handleSerialCellChange = (tag: string, value: string) => {
        const newData = { ...serialData, [tag]: value };
        setSerialData(newData);
    };

    const syncSerialJson = (rows: number, cols: number, data: Record<string, string>) => {
        const filteredData: Record<string, string> = {};
        for (let r = 1; r <= rows; r++) {
            for (let c = 1; c <= cols; c++) {
                const tag = `serial_${r}_${c}`;
                if (data && data[tag] !== undefined && data[tag] !== "") {
                    filteredData[tag] = data[tag];
                }
            }
        }
        const json = JSON.stringify({ rows, cols, data: filteredData });
        setFormData({ serialJson: json });
        return json;
    };

    // Auto-sync serialJson whenever anything changes
    useEffect(() => {
        if (isOpen) {
            syncSerialJson(serialRows, serialCols, serialData);
        }
    }, [serialRows, serialCols, serialData, isOpen]);

    const handleUpdateGrid = () => {
        syncSerialJson(serialRows, serialCols, serialData);
    };

    // --- Submit ---
    const createMutation = useCreateTestingDevice();
    const updateMutation = useUpdateTestingDevice();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const missingFields: string[] = [];
        if (!formData.operatingName.trim()) missingFields.push("Tên vận hành");
        if (!formData.deviceTypeId) missingFields.push("Loại thiết bị");
        if (!formData.partnerId) missingFields.push("Công ty / Trạm biến áp");
        if (!formData.voltageLevelId) missingFields.push("Cấp điện áp");
        if (!formData.bayId) missingFields.push("Ngăn lộ");

        if (missingFields.length > 0) {
            toast.warning(
                <div>
                    <p className="font-semibold mb-1">Vui lòng điền đủ thông tin:</p>
                    <ul className="list-disc ml-4 text-xs">
                        {missingFields.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
            );
            return;
        }

        const { model, ...rest } = formData as any;
        const payload = {
            ...rest,
            deviceModel: formData.deviceModel || model || "",
            testCycle: Number(formData.testCycle),
            warrantyMonths: formData.warrantyMonths ? Number(formData.warrantyMonths) : undefined,
            productionYear: formData.productionYear ? Number(formData.productionYear) : undefined,
            nominalVoltage: formData.nominalVoltage ? Number(formData.nominalVoltage) : undefined,
            nominalCurrent: formData.nominalCurrent ? Number(formData.nominalCurrent) : undefined,
            shortCircuitCurrent: formData.shortCircuitCurrent ? Number(formData.shortCircuitCurrent) : undefined,
            nominalDischargeCurrent: formData.nominalDischargeCurrent,
            continuousOperatingVoltage: formData.continuousOperatingVoltage,
            leakageCurrentScale: formData.leakageCurrentScale,
            vectorGroup: formData.vectorGroup,
            protectionObject: formData.protectionObject,
            testLocation: formData.testLocation,
            settingOrder: formData.settingOrder,
            lineVtRatio: formData.lineVtRatio,
            busVtRatio: formData.busVtRatio,
            ctRatio1: formData.ctRatio1,
            ctRatio2: formData.ctRatio2,
        };

        if (device) {
            updateMutation.mutate({ id: device._id, data: payload as any }, {
                onSuccess: () => {
                    resetFormData();
                    onClose();
                }
            });
        } else {
            createMutation.mutate(payload as any, {
                onSuccess: () => {
                    resetFormData();
                    onClose();
                }
            });
        }
    };

    const handleChange = (field: keyof TestingDeviceFormData, value: any) => {
        setFormData({ [field]: value });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={device ? mdiSquareEditOutline : mdiToolboxOutline} size={0.8} className="flex-shrink-0" />
                        <span>{device ? "Cập nhật thiết bị thí nghiệm" : "Thêm mới thiết bị thí nghiệm"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    <form id="device-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap text-sm uppercase">Đơn vị quản lý</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                <div className="space-y-1">
                                    <Label>Công ty / Trạm biến áp <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(v) => {
                                            setFormData({
                                                partnerId: v,
                                                voltageLevelId: "",
                                                bayId: ""
                                            });
                                        }}
                                        value={formData.partnerId || undefined}
                                        onOpenChange={(open) => !open && setPartnerSearch("")}
                                        disabled={isPartner}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn công ty" />
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
                                                        placeholder="Nhập từ khóa tìm kiếm công ty..."
                                                        value={partnerSearch}
                                                        onChange={(e) => setPartnerSearch(e.target.value)}
                                                        onClear={() => setPartnerSearch("")}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                        onKeyDownCapture={(e) => e.stopPropagation()}
                                                        autoFocus
                                                        onBlur={(e) => e.target.focus()}
                                                        className="pl-8 py-2 w-full bg-transparent"
                                                    />
                                                </div>
                                            </div>
                                            {filteredPartners.length > 0 ? (
                                                filteredPartners.map((p: any) => (
                                                    <SelectItem key={p._id} value={p._id}>{p.partnerName}</SelectItem>
                                                ))
                                            ) : (
                                                <div className="py-4 text-center text-sm text-neutral-400 italic">
                                                    Không tìm thấy kết quả
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label>Cấp điện áp <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(v) => {
                                            setFormData({
                                                voltageLevelId: v,
                                                bayId: ""
                                            });
                                        }}
                                        value={formData.voltageLevelId || undefined}
                                        disabled={!selectedPartnerId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn cấp điện áp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {voltageLevels.map((vl: any) => (
                                                <SelectItem key={vl._id} value={vl._id}>{vl.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label>Ngăn lộ <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(v) => handleChange("bayId", v)}
                                        value={formData.bayId || undefined}
                                        disabled={!selectedVoltageLevelId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn ngăn lộ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bays.length > 0 ? bays.map((b: any) => (
                                                <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                                            )) : (
                                                <SelectItem value="none" disabled>Không có dữ liệu</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Thông tin thiết bị */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap text-sm uppercase">Thông tin thiết bị</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-1">
                                    <Label>Loại thiết bị <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(v) => handleChange("deviceTypeId", v)}
                                        value={formData.deviceTypeId || undefined}
                                        onOpenChange={(open) => !open && setDeviceTypeSearch("")}
                                    >
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
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1 md:col-span-2">
                                        <Label>Vị trí lắp đặt <i className="capitalize text-neutral-400">(Site) <span className="text-red-500">*</span></i></Label>
                                        <Input
                                            id="site"
                                            value={formData.site || ""}
                                            onChange={(e) => handleChange("site", e.target.value)}
                                            placeholder="Ví dụ: Trạm 220kV Lao Bảo"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="equipmentCode">Mã thiết bị <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="equipmentCode"
                                        value={formData.equipmentCode}
                                        onChange={(e) => handleChange("equipmentCode", e.target.value)}
                                        placeholder="Ví dụ: EAS-TB-001"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="designatedName">Tên chỉ danh <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="designatedName"
                                        value={formData.designatedName}
                                        onChange={(e) => handleChange("designatedName", e.target.value)}
                                        placeholder="Ví dụ: T1, 231..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="operatingName">Tên vận hành <i className="capitalize text-neutral-400">(Model)</i><span className="text-red-500">*</span></Label>
                                    <Input
                                        id="operatingName"
                                        value={formData.operatingName}
                                        onChange={(e) => handleChange("operatingName", e.target.value)}
                                        placeholder="Ví dụ: 271, MBA T1..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="manufacturer">Hãng sản xuất <i className="capitalize text-neutral-400">(Manufacturer)</i></Label>
                                    <Input
                                        id="manufacturer"
                                        value={formData.manufacturer}
                                        onChange={(e) => handleChange("manufacturer", e.target.value)}
                                        placeholder="Ví dụ: ABB, Siemens..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="productionYear">Năm sản xuất <i className="capitalize text-neutral-400">(Year of manufacture)</i></Label>
                                    <Input
                                        id="productionYear"
                                        type="number"
                                        value={formData.productionYear || ""}
                                        onChange={(e) => handleChange("productionYear", e.target.value)}
                                        placeholder="Ví dụ: 2024"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="commissioningDate">Ngày vận hành</Label>
                                    <DatePicker
                                        date={formData.commissioningDate ? new Date(formData.commissioningDate) : undefined}
                                        onDateChange={(date) => handleChange("commissioningDate", date?.toISOString())}
                                        placeholder="Chọn ngày vận hành"
                                        captionLayout="dropdown"
                                        toYear={new Date().getFullYear() + 10}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="testCycle">Chu kỳ thí nghiệm (Năm)</Label>
                                    <QuantityInput
                                        value={Number(formData.testCycle) || 0}
                                        onChange={(v) => handleChange("testCycle", v)}
                                        min={1}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="warrantyMonths">Bảo hành (Tháng)</Label>
                                    <QuantityInput
                                        value={Number(formData.warrantyMonths) || 12}
                                        onChange={(v) => handleChange("warrantyMonths", v)}
                                        min={1}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* VT Specific Fields (TU) */}
                        {(deviceTypeName.includes("TU") || deviceTypeName.includes("Máy biến điện áp")) && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                        <Input
                                            id="deviceModel"
                                            value={formData.deviceModel}
                                            onChange={(e) => handleChange("deviceModel", e.target.value)}
                                            placeholder="Ví dụ: OFAF, ONAN..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="accuracyClass">Cấp chính xác <i className="capitalize text-neutral-400">(Class)</i></Label>
                                        <Input
                                            id="accuracyClass"
                                            value={formData.accuracyClass}
                                            onChange={(e) => handleChange("accuracyClass", e.target.value)}
                                            placeholder="Ví dụ: 0.2, 0.5..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="capacity">Công suất (VA) <i className="capitalize text-neutral-400">(Burden)</i></Label>
                                        <Input
                                            id="capacity"
                                            value={formData.capacity}
                                            onChange={(e) => handleChange("capacity", e.target.value)}
                                            placeholder="Ví dụ: 10, 25..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalVoltage">Điện áp định mức (kV) <i className="capitalize text-neutral-400">(Rated voltage)</i></Label>
                                        <Input
                                            id="nominalVoltage"
                                            type="number"
                                            value={formData.nominalVoltage || ""}
                                            onChange={(e) => handleChange("nominalVoltage", e.target.value)}
                                            placeholder="Ví dụ: 110, 220..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="capacitance">Điện dung <i className="capitalize text-neutral-400">(Capacitance)</i></Label>
                                        <Input
                                            id="capacitance"
                                            value={formData.capacitance}
                                            onChange={(e) => handleChange("capacitance", e.target.value)}
                                            placeholder="Ví dụ: 100... pF"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="transformationRatio">Tỷ số biến <i className="capitalize text-neutral-400">(Ratio)</i></Label>
                                        <Input
                                            id="transformationRatio"
                                            value={formData.transformationRatio}
                                            onChange={(e) => handleChange("transformationRatio", e.target.value)}
                                            placeholder="Ví dụ: 110kV/110V"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Circuit Breaker Specific Fields (MC) */}
                        {(deviceTypeName.includes("MC") || deviceTypeName.includes("Máy cắt")) && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                        <Input
                                            id="deviceModel"
                                            value={formData.deviceModel}
                                            onChange={(e) => handleChange("deviceModel", e.target.value)}
                                            placeholder="Ví dụ: SF6..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalVoltage">Điện áp định mức (kV) <i className="capitalize text-neutral-400">(Rated voltage)</i></Label>
                                        <Input
                                            id="nominalVoltage"
                                            type="number"
                                            step="any"
                                            value={formData.nominalVoltage || ""}
                                            onChange={(e) => handleChange("nominalVoltage", e.target.value)}
                                            placeholder="Ví dụ: 110"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalCurrent">Dòng định mức (A) <i className="capitalize text-neutral-400">(Rated current)</i></Label>
                                        <Input
                                            id="nominalCurrent"
                                            type="number"
                                            step="any"
                                            value={formData.nominalCurrent || ""}
                                            onChange={(e) => handleChange("nominalCurrent", e.target.value)}
                                            placeholder="Ví dụ: 2000"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="shortCircuitCurrent">Dòng cắt ngắn mạch định mức (kA) <i className="capitalize text-neutral-400">(Short circuit breaking current)</i></Label>
                                        <Input
                                            id="shortCircuitCurrent"
                                            type="number"
                                            step="any"
                                            value={formData.shortCircuitCurrent || ""}
                                            onChange={(e) => handleChange("shortCircuitCurrent", e.target.value)}
                                            placeholder="Ví dụ: 31.5"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Current Transformer Specific Fields (TI) */}
                        {(deviceTypeName.includes("TI") || deviceTypeName.includes("Máy biến dòng điện")) && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                        <Input
                                            id="deviceModel"
                                            value={formData.deviceModel}
                                            onChange={(e) => handleChange("deviceModel", e.target.value)}
                                            placeholder="Ví dụ: CT..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="accuracyClass">Cấp chính xác <i className="capitalize text-neutral-400">(Class)</i></Label>
                                        <Input
                                            id="accuracyClass"
                                            value={formData.accuracyClass}
                                            onChange={(e) => handleChange("accuracyClass", e.target.value)}
                                            placeholder="Ví dụ: 0.2, 0.5..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="capacity">Công suất (VA) <i className="capitalize text-neutral-400">(Burden)</i></Label>
                                        <Input
                                            id="capacity"
                                            value={formData.capacity}
                                            onChange={(e) => handleChange("capacity", e.target.value)}
                                            placeholder="Ví dụ: 10, 25..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalVoltage">Điện áp định mức (kV) <i className="capitalize text-neutral-400">(Rated voltage)</i></Label>
                                        <Input
                                            id="nominalVoltage"
                                            type="number"
                                            step="any"
                                            value={formData.nominalVoltage || ""}
                                            onChange={(e) => handleChange("nominalVoltage", e.target.value)}
                                            placeholder="Ví dụ: 110, 220..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalCurrent">Dòng điện định mức (A) <i className="capitalize text-neutral-400">(Rated current)</i></Label>
                                        <Input
                                            id="nominalCurrent"
                                            type="number"
                                            step="any"
                                            value={formData.nominalCurrent || ""}
                                            onChange={(e) => handleChange("nominalCurrent", e.target.value)}
                                            placeholder="Ví dụ: 100, 200..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="transformationRatio">Tỷ số biến <i className="capitalize text-neutral-400">(Ratio)</i></Label>
                                        <Input
                                            id="transformationRatio"
                                            value={formData.transformationRatio}
                                            onChange={(e) => handleChange("transformationRatio", e.target.value)}
                                            placeholder="Ví dụ: 100/5A"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* DCL (Dao cách ly) Specific Fields */}
                        {(deviceTypeName.includes("DCL") || deviceTypeName.includes("Dao cách ly")) && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                        <Input
                                            id="deviceModel"
                                            value={formData.deviceModel}
                                            onChange={(e) => handleChange("deviceModel", e.target.value)}
                                            placeholder="Ví dụ: DS..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalVoltage">Điện áp định mức (kV) <i className="capitalize text-neutral-400">(Rated voltage)</i></Label>
                                        <Input
                                            id="nominalVoltage"
                                            type="number"
                                            step="any"
                                            value={formData.nominalVoltage || ""}
                                            onChange={(e) => handleChange("nominalVoltage", e.target.value)}
                                            placeholder="Ví dụ: 110"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalCurrent">Dòng điện định mức (A) <i className="capitalize text-neutral-400">(Rated current)</i></Label>
                                        <Input
                                            id="nominalCurrent"
                                            type="number"
                                            step="any"
                                            value={formData.nominalCurrent || ""}
                                            onChange={(e) => handleChange("nominalCurrent", e.target.value)}
                                            placeholder="Ví dụ: 630, 1250..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lightning Arrester Specific Fields (CSV) */}
                        {(deviceTypeName.includes("CSV") || deviceTypeName.includes("Chống sét van")) && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                        <Input id="deviceModel" value={formData.deviceModel} onChange={(e) => handleChange("deviceModel", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalVoltage">Điện áp định mức (kV) <i className="capitalize text-neutral-400">(Rated voltage)</i></Label>
                                        <Input id="nominalVoltage" type="number" step="any" value={formData.nominalVoltage || ""} onChange={(e) => handleChange("nominalVoltage", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalDischargeCurrent">Dòng phóng danh định (kA) <i className="capitalize text-neutral-400">(Nominal discharge current)</i></Label>
                                        <Input id="nominalDischargeCurrent" value={formData.nominalDischargeCurrent} onChange={(e) => handleChange("nominalDischargeCurrent", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="continuousOperatingVoltage">Điện áp vận hành liên tục <i className="capitalize text-neutral-400">(Continuous operating voltage)</i></Label>
                                        <Input id="continuousOperatingVoltage" value={formData.continuousOperatingVoltage} onChange={(e) => handleChange("continuousOperatingVoltage", e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Surge Counter Specific Fields (TBDS) */}
                        {(deviceTypeName.includes("TBDS") || deviceTypeName.includes("Thiết bị đếm sét")) && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                        <Input id="deviceModel" value={formData.deviceModel} onChange={(e) => handleChange("deviceModel", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalVoltage">Điện áp định mức (kV) <i className="capitalize text-neutral-400">(Rated voltage)</i></Label>
                                        <Input id="nominalVoltage" type="number" step="any" value={formData.nominalVoltage || ""} onChange={(e) => handleChange("nominalVoltage", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="leakageCurrentScale">Thang đo dòng rò</Label>
                                        <Input id="leakageCurrentScale" value={formData.leakageCurrentScale} onChange={(e) => handleChange("leakageCurrentScale", e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Transformer (MBA) Specific Fields */}
                        {(deviceTypeName.includes("MBA") && deviceTypeName.includes("Máy biến áp")) && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                        <Input id="deviceModel" value={formData.deviceModel} onChange={(e) => handleChange("deviceModel", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="vectorGroup">Tổ đấu dây</Label>
                                        <Input id="vectorGroup" value={formData.vectorGroup} onChange={(e) => handleChange("vectorGroup", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="capacity">Công suất <i className="capitalize text-neutral-400">(Burden)</i></Label>
                                        <Input id="capacity" value={formData.capacity} onChange={(e) => handleChange("capacity", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalVoltage">Điện áp định mức (kV) <i className="capitalize text-neutral-400">(Rated voltage)</i></Label>
                                        <Input id="nominalVoltage" type="number" step="any" value={formData.nominalVoltage || ""} onChange={(e) => handleChange("nominalVoltage", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="nominalCurrent">Dòng điện định mức (A) <i className="capitalize text-neutral-400">(Rated current)</i></Label>
                                        <Input id="nominalCurrent" type="number" step="any" value={formData.nominalCurrent || ""} onChange={(e) => handleChange("nominalCurrent", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="transformationRatio">Tỷ số biến áp <i className="capitalize text-neutral-400">(Ratio)</i></Label>
                                        <Input id="transformationRatio" value={formData.transformationRatio} onChange={(e) => handleChange("transformationRatio", e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Power Cable (CBL) Specific Fields */}
                        {(deviceTypeName.includes("CBL") || deviceTypeName.includes("Cáp lực")) && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="cableSize">Kiểu và kích cỡ <i className="capitalize text-neutral-400">(Style and size)</i></Label>
                                        <Input
                                            id="cableSize"
                                            value={formData.cableSize}
                                            onChange={(e) => handleChange("cableSize", e.target.value)}
                                            placeholder="Ví dụ: Cu/XLPE/PVC 3x240mm2"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="cableType">Loại cáp <i className="capitalize text-neutral-400">(Cable type)</i></Label>
                                        <Input
                                            id="cableType"
                                            value={formData.cableType}
                                            onChange={(e) => handleChange("cableType", e.target.value)}
                                            placeholder="Ví dụ: Cáp đồng, Cáp nhôm..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fused Cutout (CC) Specific Fields */}
                        {(deviceTypeName.includes("CC") || deviceTypeName.includes("Cầu chì tự rơi")) && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                        <Input id="deviceModel" value={formData.deviceModel} onChange={(e) => handleChange("deviceModel", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="quantity">Số lượng <i className="capitalize text-neutral-400">(Quantity)</i></Label>
                                        <QuantityInput
                                            value={formData.quantity || 1}
                                            onChange={(value) => handleChange("quantity", value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="testLocation">Nơi thí nghiệm <i className="capitalize text-neutral-400">(Location test)</i></Label>
                                        <Input
                                            id="testLocation"
                                            value={formData.testLocation}
                                            onChange={(e) => handleChange("testLocation", e.target.value)}
                                            placeholder="Ví dụ: Trạm 220kV..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Overcurrent Protection Specific Fields (Quá dòng) */}
                        {deviceTypeName.toLowerCase().includes("quá dòng") && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="protectionObject">Đối tượng bảo vệ <i className="capitalize text-neutral-400">(Protection Object)</i></Label>
                                        <Input
                                            id="protectionObject"
                                            value={formData.protectionObject}
                                            onChange={(e) => handleChange("protectionObject", e.target.value)}
                                            placeholder="Ví dụ: MBA T1, Đường dây 171..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="testLocation">Nơi thí nghiệm <i className="capitalize text-neutral-400">(Location test)</i></Label>
                                        <Input
                                            id="testLocation"
                                            value={formData.testLocation}
                                            onChange={(e) => handleChange("testLocation", e.target.value)}
                                            placeholder="Ví dụ: Trạm 220kV..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="settingOrder">Phiếu chỉnh định <i className="capitalize text-neutral-400">(Setting Order)</i></Label>
                                        <Input
                                            id="settingOrder"
                                            value={formData.settingOrder}
                                            onChange={(e) => handleChange("settingOrder", e.target.value)}
                                            placeholder="Ví dụ: 123/PCD-..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                        <Input
                                            id="deviceModel"
                                            value={formData.deviceModel}
                                            onChange={(e) => handleChange("deviceModel", e.target.value)}
                                            placeholder="Ví dụ: REF615, MiCOM P127..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Line VT ratio</Label>
                                        <Input
                                            value={formData.lineVtRatio}
                                            onChange={(e) => handleChange("lineVtRatio", e.target.value)}
                                            placeholder="Ví dụ: 110kV/110V"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Bus VT ratio</Label>
                                        <Input
                                            value={formData.busVtRatio}
                                            onChange={(e) => handleChange("busVtRatio", e.target.value)}
                                            placeholder="Ví dụ: 110kV/110V"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>CT ratio 1</Label>
                                        <Input
                                            value={formData.ctRatio1}
                                            onChange={(e) => handleChange("ctRatio1", e.target.value)}
                                            placeholder="Ví dụ: 100/1A"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>CT ratio 2</Label>
                                        <Input
                                            value={formData.ctRatio2}
                                            onChange={(e) => handleChange("ctRatio2", e.target.value)}
                                            placeholder="Ví dụ: 100/1A"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Protection Bay Unit Specific Fields (Mức ngăn / BU) */}
                        {(deviceTypeName.includes("thanh cái mức ngăn") && deviceTypeName.includes("BU")) && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                        <Input
                                            id="deviceModel"
                                            value={formData.deviceModel}
                                            onChange={(e) => handleChange("deviceModel", e.target.value)}
                                            placeholder="Ví dụ: REF615, MiCOM P127..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="protectionObject">Đối tượng bảo vệ <i className="capitalize text-neutral-400">(Protection Object)</i></Label>
                                        <Input
                                            id="protectionObject"
                                            value={formData.protectionObject}
                                            onChange={(e) => handleChange("protectionObject", e.target.value)}
                                            placeholder="Ví dụ: MBA T1, Đường dây 171..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="testLocation">Nơi thí nghiệm <i className="capitalize text-neutral-400">(Location test)</i></Label>
                                        <Input
                                            id="testLocation"
                                            value={formData.testLocation}
                                            onChange={(e) => handleChange("testLocation", e.target.value)}
                                            placeholder="Ví dụ: Trạm 220kV..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="settingOrder">Phiếu chỉnh định <i className="capitalize text-neutral-400">(Setting Order)</i></Label>
                                        <Input
                                            id="settingOrder"
                                            value={formData.settingOrder}
                                            onChange={(e) => handleChange("settingOrder", e.target.value)}
                                            placeholder="Ví dụ: 123/PCD-..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Tỉ số biến dòng điện <i className="capitalize text-neutral-400">(current transformation ratio)</i></Label>
                                        <Input
                                            value={formData.ctRatio1}
                                            onChange={(e) => handleChange("ctRatio1", e.target.value)}
                                            placeholder="Ví dụ: 100/1A"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {
                            (deviceTypeName.includes("thanh cái") && !deviceTypeName.includes("BU")) && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                            <Input
                                                id="deviceModel"
                                                value={formData.deviceModel}
                                                onChange={(e) => handleChange("deviceModel", e.target.value)}
                                                placeholder="Ví dụ: REF615, MiCOM P127..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="protectionObject">Đối tượng bảo vệ <i className="capitalize text-neutral-400">(Protection Object)</i></Label>
                                            <Input
                                                id="protectionObject"
                                                value={formData.protectionObject}
                                                onChange={(e) => handleChange("protectionObject", e.target.value)}
                                                placeholder="Ví dụ: MBA T1, Đường dây 171..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="testLocation">Nơi thí nghiệm <i className="capitalize text-neutral-400">(Location test)</i></Label>
                                            <Input
                                                id="testLocation"
                                                value={formData.testLocation}
                                                onChange={(e) => handleChange("testLocation", e.target.value)}
                                                placeholder="Ví dụ: Trạm 220kV..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="settingOrder">Phiếu chỉnh định <i className="capitalize text-neutral-400">(Setting Order)</i></Label>
                                            <Input
                                                id="settingOrder"
                                                value={formData.settingOrder}
                                                onChange={(e) => handleChange("settingOrder", e.target.value)}
                                                placeholder="Ví dụ: 123/PCD-..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        }



                        {/* Transformer Differential Protection Specific Fields (So lệch MBA) */}
                        {deviceTypeName.toLowerCase().includes("so lệch mba") && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                        <Input
                                            id="deviceModel"
                                            value={formData.deviceModel}
                                            onChange={(e) => handleChange("deviceModel", e.target.value)}
                                            placeholder="Ví dụ: REF615, MiCOM P127..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="protectionObject">Đối tượng bảo vệ <i className="capitalize text-neutral-400">(Protection Object)</i></Label>
                                        <Input
                                            id="protectionObject"
                                            value={formData.protectionObject}
                                            onChange={(e) => handleChange("protectionObject", e.target.value)}
                                            placeholder="Ví dụ: MBA T1, Đường dây 171..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="testLocation">Nơi thí nghiệm <i className="capitalize text-neutral-400">(Location test)</i></Label>
                                        <Input
                                            id="testLocation"
                                            value={formData.testLocation}
                                            onChange={(e) => handleChange("testLocation", e.target.value)}
                                            placeholder="Ví dụ: Trạm 220kV..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="settingOrder">Phiếu chỉnh định <i className="capitalize text-neutral-400">(Setting Order)</i></Label>
                                        <Input
                                            id="settingOrder"
                                            value={formData.settingOrder}
                                            onChange={(e) => handleChange("settingOrder", e.target.value)}
                                            placeholder="Ví dụ: 123/PCD-..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>HV winding</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                value={formData.hvWinding}
                                                onChange={(e) => handleChange("hvWinding", e.target.value)}
                                                placeholder="Phía ...kV"
                                            />
                                            <Input
                                                value={formData.ctRatio1}
                                                onChange={(e) => handleChange("ctRatio1", e.target.value)}
                                                placeholder="CT ratio"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>MV winding</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                value={formData.mvWinding}
                                                onChange={(e) => handleChange("mvWinding", e.target.value)}
                                                placeholder="Phía ...kV"
                                            />
                                            <Input
                                                value={formData.ctRatio2}
                                                onChange={(e) => handleChange("ctRatio2", e.target.value)}
                                                placeholder="CT ratio"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>LV winding</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                value={formData.lvWinding}
                                                onChange={(e) => handleChange("lvWinding", e.target.value)}
                                                placeholder="Phía ...kV"
                                            />
                                            <Input
                                                value={formData.ctRatio3}
                                                onChange={(e) => handleChange("ctRatio3", e.target.value)}
                                                placeholder="CT ratio"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Overcurrent Protection Specific Fields (Quá dòng) */}
                        {(() => {
                            const normalizedName = deviceTypeName.normalize("NFC").toLowerCase();
                            return normalizedName.includes("khoảng cách".normalize("NFC")) || normalizedName.includes("so lệch đường dây".normalize("NFC"));
                        })() && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="protectionObject">Đối tượng bảo vệ <i className="capitalize text-neutral-400">(Protection Object)</i></Label>
                                            <Input
                                                id="protectionObject"
                                                value={formData.protectionObject}
                                                onChange={(e) => handleChange("protectionObject", e.target.value)}
                                                placeholder="Ví dụ: MBA T1, Đường dây 171..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="testLocation">Nơi thí nghiệm <i className="capitalize text-neutral-400">(Location test)</i></Label>
                                            <Input
                                                id="testLocation"
                                                value={formData.testLocation}
                                                onChange={(e) => handleChange("testLocation", e.target.value)}
                                                placeholder="Ví dụ: Trạm 220kV..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="settingOrder">Phiếu chỉnh định <i className="capitalize text-neutral-400">(Setting Order)</i></Label>
                                            <Input
                                                id="settingOrder"
                                                value={formData.settingOrder}
                                                onChange={(e) => handleChange("settingOrder", e.target.value)}
                                                placeholder="Ví dụ: 123/PCD-..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="deviceModel">Kiểu máy <i className="capitalize text-neutral-400">(Type)</i></Label>
                                            <Input
                                                id="deviceModel"
                                                value={formData.deviceModel}
                                                onChange={(e) => handleChange("deviceModel", e.target.value)}
                                                placeholder="Ví dụ: REF615, MiCOM P127..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Line VT ratio</Label>
                                            <Input
                                                value={formData.lineVtRatio}
                                                onChange={(e) => handleChange("lineVtRatio", e.target.value)}
                                                placeholder="Ví dụ: 110kV/110V"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Bus VT ratio</Label>
                                            <Input
                                                value={formData.busVtRatio}
                                                onChange={(e) => handleChange("busVtRatio", e.target.value)}
                                                placeholder="Ví dụ: 110kV/110V"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>CT ratio 1</Label>
                                            <Input
                                                value={formData.ctRatio1}
                                                onChange={(e) => handleChange("ctRatio1", e.target.value)}
                                                placeholder="Ví dụ: 100/1A"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>CT ratio 2</Label>
                                            <Input
                                                value={formData.ctRatio2}
                                                onChange={(e) => handleChange("ctRatio2", e.target.value)}
                                                placeholder="Ví dụ: 100/1A"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        {/* Section 3: Cấu hình Serial */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-accent font-semibold whitespace-nowrap text-sm uppercase">Cấu hình Serial</h3>
                                <div className="flex-1 border-b border-dashed border-accent mr-1" />
                            </div>

                            <Card className="p-4 border border-darkBorderV1 bg-darkCardV1/50 space-y-4">
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-neutral-400">Số hàng (Row)</Label>
                                        <QuantityInput
                                            value={serialRows}
                                            onChange={(v) => setSerialRows(v)}
                                            min={1}
                                            className="w-32"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-neutral-400">Số cột (Col)</Label>
                                        <QuantityInput
                                            value={serialCols}
                                            onChange={(v) => setSerialCols(v)}
                                            min={1}
                                            className="w-32"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleUpdateGrid}
                                    >
                                        <Icon path={mdiRefresh} size={0.8} />
                                        Tạo/Cập nhật bảng
                                    </Button>
                                </div>

                                <div className="overflow-x-auto border border-darkBorderV1">
                                    <table className="w-full text-sm text-center border-collapse">
                                        <thead>
                                            <tr className="bg-darkBackgroundV1/50">
                                                <th className="p-2 border border-darkBorderV1 text-neutral-400 w-12 font-normal italic">#</th>
                                                {Array.from({ length: serialCols }).map((_, c) => (
                                                    <th key={c} className="p-2 border border-darkBorderV1 text-accent font-semibold">
                                                        Cột {c + 1}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from({ length: serialRows }).map((_, r) => (
                                                <tr key={r}>
                                                    <td className="p-2 border border-darkBorderV1 bg-darkBackgroundV1/50 text-neutral-400 font-medium">H{r + 1}</td>
                                                    {Array.from({ length: serialCols }).map((_, c) => {
                                                        const tag = `serial_${r + 1}_${c + 1}`;
                                                        return (
                                                            <td key={c} className="p-1 border border-darkBorderV1 bg-transparent">
                                                                <input
                                                                    type="text"
                                                                    value={serialData[tag] || ""}
                                                                    onChange={(e) => handleSerialCellChange(tag, e.target.value)}
                                                                    placeholder="..."
                                                                    className="w-full bg-transparent border-none focus:ring-1 focus:ring-accent rounded px-2 py-1 text-center text-neutral-300 placeholder:text-neutral-400 outline-none"
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    <Button type="submit" form="device-form" disabled={isPending}>
                        {isPending ? (
                            <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                        ) : (
                            <Icon path={device ? mdiContentSave : mdiPlus} size={0.8} />
                        )}
                        {device ? "Lưu thay đổi" : "Thêm mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
