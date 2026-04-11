"use client";

import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useMe } from "@/hooks/useAuth";
import { useDeleteFileVersion, useJobPlanDetails, useJobPlanVersions, useUpdateVersion } from "@/hooks/useJobPlans";
import { useUploadPdf } from "@/hooks/useUpload";
import { IJobPlanFileVersion, IJobPlanVersion } from "@/interface/jobPlan";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { JobPlanVersionDialog } from "../JobPlanVersionDialog";

import { WorkspaceChatColumn } from "./WorkspaceChatColumn";
import { WorkspaceLeftColumn } from "./WorkspaceLeftColumn";

interface WorkspacePageProps {
    planId: string;
}

export default function WorkspacePage({ planId }: WorkspacePageProps) {
    const router = useRouter();
    const { data: planResponse, isLoading } = useJobPlanDetails(planId);
    const { data: versionsResponse } = useJobPlanVersions(planId);
    const { data: profileResponse } = useMe();
    const profile = profileResponse?.data;
    const isPartner = profile?.role === "partner";
    const uploadPdfMutation = useUploadPdf();
    const updateVersionMutation = useUpdateVersion();
    const deleteFileVersionMutation = useDeleteFileVersion();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeVersion, setActiveVersion] = useState<IJobPlanVersion | null>(null);

    const plan = planResponse?.data;
    const versions: IJobPlanVersion[] = (versionsResponse?.data || []).sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);

    const handleFileUpload = (version: IJobPlanVersion) => {
        setActiveVersion(version);
        fileInputRef.current?.click();
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeVersion) return;

        try {
            const res = await uploadPdfMutation.mutateAsync(file);
            const fileUrl = res?.data?.fileUrl || res?.data?.url || res?.url;

            if (!fileUrl) {
                return;
            }

            const newFile: IJobPlanFileVersion = {
                fileName: file.name,
                fileUrl: fileUrl,
                fileType: file.type || "application/pdf",
                fileSize: file.size
            };

            const sanitizedFiles = (activeVersion.files || []).map(({ _id, ...rest }: any) => rest);

            await updateVersionMutation.mutateAsync({
                id: planId,
                data: {
                    name: activeVersion.name,
                    notes: activeVersion.notes,
                    files: [...sanitizedFiles, newFile]
                }
            });
        } catch (error) {
            console.error("Upload/Update failed:", error);
        } finally {
            if (e.target) e.target.value = "";
            setActiveVersion(null);
        }
    };

    const handleDeleteFile = async (version: IJobPlanVersion, fileUrl: string) => {
        try {
            await deleteFileVersionMutation.mutateAsync({
                planId,
                version,
                fileUrl
            });
        } catch (error) {
            console.error("Delete file failed:", error);
        }
    };

    return (
        <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
            <div className="flex justify-between items-center">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={isPartner ? "/partner/work-exchange" : "/admin/work-exchange"}>Trao đổi công việc</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Phương án: {plan?.planName || "..."}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="text-neutral-400 text-sm flex items-center gap-1">
                    <Badge variant="green">Đối tác:</Badge>
                    <Badge variant="neutral">{typeof plan?.partnerId === "object" ? (plan.partnerId as any).partnerName : "Tên công ty"}</Badge>
                    <span>--</span>
                    <Badge variant="green">Trạng thái:</Badge>
                    <Badge variant="neutral">{plan?.status || "Đang tải"}</Badge>
                </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 flex items-stretch bg-darkBackgroundV1 border border-darkBorderV1 rounded-2xl overflow-hidden min-h-[500px]">
                <WorkspaceLeftColumn
                    versions={versions}
                    onFileUpload={handleFileUpload}
                    onDeleteFile={handleDeleteFile}
                    uploadPending={uploadPdfMutation.isPending}
                    updatePending={updateVersionMutation.isPending}
                    setIsVersionDialogOpen={setIsVersionDialogOpen}
                />

                <WorkspaceChatColumn planId={planId} profile={profile} />
            </div>

            <JobPlanVersionDialog
                isOpen={isVersionDialogOpen}
                onClose={() => setIsVersionDialogOpen(false)}
                planId={planId}
            />

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={onFileChange}
            />
        </div>
    );
}
