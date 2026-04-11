"use client";

interface TextMessageProps {
    content: string;
    isMe: boolean;
    replyTo?: any;
}

export function TextMessage({ content, isMe, replyTo }: TextMessageProps) {
    return (
        <div className={`p-3 rounded-xl text-base border flex flex-col gap-2 ${isMe
            ? "bg-accent/10 border-accent/20 text-accent rounded-tr-none"
            : "bg-darkBackgroundV1 border-darkBorderV1 text-neutral-300 rounded-tl-none"
            }`}>
            {replyTo && (
                <div className={`mb-1 pl-3 py-1 border-l-2 border-accent/60 bg-white/5 rounded-r-md text-sm cursor-pointer`}>
                    <div className="font-bold text-neutral-300 text-sm mb-0.5">
                        {replyTo.senderName}
                    </div>
                    <div className="text-neutral-400 italic truncate line-clamp-1">
                        {replyTo.content}
                    </div>
                </div>
            )}
            <div>{content}</div>
        </div>
    );
}
