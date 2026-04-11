"use client";

import { FileRecordCard } from "@/components/ui/FileRecordCard";

interface FileMessageProps {
    msg: any;
    isMe: boolean;
    replyTo?: any;
}

export function FileMessage({ msg, isMe, replyTo }: FileMessageProps) {
    return (
        <div className={`p-1 rounded-xl border flex flex-col gap-1 ${isMe ? "bg-accent/10 border-accent/20 rounded-tr-none" : "bg-darkBackgroundV1 border-darkBorderV1 rounded-tl-none"}`}>
            {replyTo && (
                <div className={`mx-1 mt-1 pl-3 py-1 border-l-2 border-accent/60 bg-white/5 rounded-r-md text-sm cursor-pointer`}>
                    <div className="font-bold text-neutral-300 text-sm mb-0.5">
                        {replyTo.senderName}
                    </div>
                    <div className="text-neutral-400 italic truncate line-clamp-1 max-w-[280px]">
                        {replyTo.content}
                    </div>
                </div>
            )}
            <FileRecordCard
                fileName={msg.fileMetadata?.fileName || "Tệp đính kèm"}
                fileUrl={msg.fileUrl}
                fileType={msg.fileMetadata?.fileType || "application/octet-stream"}
                fileSize={msg.fileMetadata?.fileSize || 0}
                createdAt={msg.createdAt}
                showDelete={false}
                className="bg-transparent border-none shadow-none"
            />
        </div>
    );
}
