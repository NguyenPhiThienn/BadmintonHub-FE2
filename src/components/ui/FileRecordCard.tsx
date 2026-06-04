import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/file";
import { formatDateWithTime } from "@/lib/format";
import { mdiFilePdfBox, mdiFileWordBox, mdiLinkVariant, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import Link from "next/link";

export interface FileRecordCardProps {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
    createdAt?: string | Date;
    onDelete?: () => void;
    showDelete?: boolean;
    className?: string;
}

export function FileRecordCard({
    fileName,
    fileUrl,
    fileType,
    fileSize = 0,
    createdAt,
    onDelete,
    showDelete = true,
    className = ""
}: FileRecordCardProps) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border border-darkBorderV1 bg-darkBackgroundV1 group ${className}`}>
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-md bg-darkBorderV1 text-white">
                <Icon
                    path={fileType?.includes("pdf") ? mdiFilePdfBox : mdiFileWordBox}
                    size={1}
                />
            </div>
            <div className="flex-1 min-w-0 pr-2 space-y-1">
                <p className="text-sm font-semibold text-neutral-300 truncate" title={fileName}>
                    {fileName}
                </p>
                <p className="text-sm text-neutral-400 uppercase">
                    {formatBytes(fileSize)} • {fileType?.includes("pdf") ? "PDF" : "DOCX"}  {createdAt && `• ${formatDateWithTime(createdAt)}`}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                    <Link
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Icon path={mdiLinkVariant} size={0.8} />
                    </Link>
                </Button>

                {showDelete && onDelete && (
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <Icon path={mdiTrashCanOutline} size={0.8} />
                    </Button>
                )}
            </div>
        </div>
    );
}
