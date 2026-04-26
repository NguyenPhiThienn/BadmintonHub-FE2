"use client";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDeviceTypes } from "@/hooks/useTesting";
import { IDeviceType } from "@/interface/testing";
import { useEffect, useState } from "react";
import { DeviceTypeSidebar } from "./DeviceTypeSidebar";
import { TestingStructure } from "./TestingStructure";

export default function TestingConfigPage() {
    const { data: deviceTypesResponse } = useDeviceTypes();
    const deviceTypes = deviceTypesResponse?.data || [];
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedId && deviceTypes.length > 0) {
            setSelectedId(deviceTypes[0]._id);
        }
    }, [deviceTypes, selectedId]);

    const selectedDeviceType = deviceTypes.find((dt: IDeviceType) => dt._id === selectedId) || null;

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
                            <BreadcrumbPage>Quản lý cấu hình thí nghiệm</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full items-start">
                    {/* Left Sidebar: Device Types */}
                    <div className="lg:col-span-3 h-full min-h-[600px]">
                        <DeviceTypeSidebar
                            selectedDeviceType={selectedDeviceType}
                            onSelect={(dt: IDeviceType) => setSelectedId(dt._id)}
                        />
                    </div>

                    {/* Right Content: Testing Structure */}
                    <div className="lg:col-span-9 h-full min-h-[600px]">
                        <TestingStructure deviceType={selectedDeviceType} />
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
