"use client";

interface ImageMessageProps {
    msg: any;
    isMe: boolean;
    replyTo?: any;
}

export function ImageMessage({ msg, isMe, replyTo }: ImageMessageProps) {
    return (
        <div className={`p-1 rounded-xl border flex flex-col gap-1 ${isMe ? "bg-accent/10 border-accent/20 rounded-tr-none" : "bg-darkBackgroundV1 border-darkBorderV1 rounded-tl-none"}`}>
            {replyTo && (
                <div className={`mx-1 mt-1 pl-2 py-1 border-l-2 border-accent/60 bg-white/5 rounded-r-md text-sm cursor-pointer`}>
                    <div className="font-semibold text-neutral-300 text-sm mb-0.5">
                        {replyTo.senderName}
                    </div>
                    <div className="text-neutral-400 italic truncate line-clamp-1 max-w-[280px]">
                        {replyTo.content}
                    </div>
                </div>
            )}
            <div className="relative group/img overflow-hidden rounded-lg max-w-[300px]">
                <img
                    src={msg.fileUrl}
                    alt={msg.content}
                    className="w-full h-auto object-cover transition-transform group-hover/img:scale-105 cursor-pointer max-h-[400px]"
                    onClick={() => window.open(msg.fileUrl, '_blank')}
                />
            </div>
        </div>
    );
}
