"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileRecordCard } from "@/components/ui/FileRecordCard";
import { IJobPlanVersion } from "@/interface/jobPlan";
import { formatDateOnly } from "@/lib/format";
import {
    mdiCloudUploadOutline,
    mdiFileQuestionOutline,
    mdiSourceBranch,
    mdiTextBoxMultiple
} from "@mdi/js";
import Icon from "@mdi/react";

interface WorkspaceLeftColumnProps {
    versions: IJobPlanVersion[];
    onFileUpload: (version: IJobPlanVersion) => void;
    onDeleteFile: (version: IJobPlanVersion, fileUrl: string) => void;
    uploadPending: boolean;
    updatePending: boolean;
    setIsVersionDialogOpen: (value: boolean) => void;
}

export function WorkspaceLeftColumn({
    versions,
    onFileUpload,
    onDeleteFile,
    uploadPending,
    updatePending,
    setIsVersionDialogOpen
}: WorkspaceLeftColumnProps) {
    return (
        <div className="w-[40%] border-r border-darkBorderV1 flex flex-col bg-darkBackgroundV1/20">
            <div className="p-3 h-14 border-b border-darkBorderV1 shrink-0 bg-accent/50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-accent">
                    <Icon path={mdiTextBoxMultiple} size={0.8} className="text-white" />
                    <span className="font-semibold text-sm text-white">Phiên bản & Tài liệu</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setIsVersionDialogOpen(true)} className="text-white border-white hover:text-neutral-300 hover:border-neutral-300">
                    <Icon path={mdiSourceBranch} size={0.8} />
                    Phiên bản mới
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <Accordion type="multiple" defaultValue={[versions[0]?.name || ""]} className="w-full">
                    {versions.length > 0 ? (
                        versions.map((version, index) => (
                            <AccordionItem
                                key={version._id || version.name + index}
                                value={version.name}
                                className={`${index === versions.length - 1 ? "border-b-0" : "border-b"} border-darkBorderV1 text-neutral-300 px-3`}
                            >
                                <AccordionTrigger className="py-3 hover:no-underline">
                                    <div className="flex items-center gap-2 pl-2">
                                        <span className="font-semibold text-accent">Phiên bản: {version.name}</span>
                                        <Badge variant="neutral">
                                            {formatDateOnly(version.createdAt || "") || "--/--"}
                                        </Badge>
                                        {index === 0 && <Badge variant="cyan">Hiện tại</Badge>}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-3 px-2">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => onFileUpload(version)}
                                        disabled={uploadPending || updatePending}
                                    >
                                        <Icon
                                            path={mdiCloudUploadOutline}
                                            size={0.8}
                                            className={(uploadPending || updatePending) ? "animate-pulse" : ""}
                                        />
                                        {(uploadPending || updatePending) ? "Đang xử lý..." : "Tải tệp lên"}
                                    </Button>

                                    <div className="space-y-2 mt-3">
                                        {version.files && version.files.length > 0 ? (
                                            version.files.map((file, fIdx) => (
                                                <FileRecordCard
                                                    key={fIdx}
                                                    fileName={file.fileName}
                                                    fileUrl={file.fileUrl}
                                                    fileType={file.fileType}
                                                    fileSize={file.fileSize}
                                                    createdAt={file.createdAt}
                                                    showDelete={true}
                                                    onDelete={() => onDeleteFile(version, file.fileUrl)}
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                                <Icon path={mdiFileQuestionOutline} size={0.8} />
                                                Chưa có tài liệu đính kèm
                                            </div>
                                        )}
                                    </div>

                                    {version.notes && (
                                        <div className="mt-3 p-2 bg-darkBackgroundV1/50 rounded-lg border border-darkBorderV1/50">
                                            <p className="text-sm text-neutral-400 italic leading-snug">
                                                Note: {version.notes}
                                            </p>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))
                    ) : (
                        <div className="text-center text-neutral-400 text-base py-8 italic flex items-center justify-center gap-2 flex-1">
                            <Icon path={mdiSourceBranch} size={0.8} />
                            Chưa có phiên bản nào được tạo.
                        </div>
                    )}
                </Accordion>
            </div>
        </div>
    );
}
