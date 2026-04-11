"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useDeleteMessageForMe, useJobPlanMessages, useRecallMessage, useSendMessage } from "@/hooks/useJobPlans";
import { useUploadFile, useUploadImage, useUploadPdf } from "@/hooks/useUpload";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiBackupRestore,
    mdiClose,
    mdiDotsVertical,
    mdiFacebookMessenger,
    mdiFileDocumentPlus,
    mdiImagePlus,
    mdiReply,
    mdiSend,
    mdiStickerEmoji,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useRef, useState } from "react";
import { FileMessage } from "./FileMessage";
import { ImageMessage } from "./ImageMessage";
import { TextMessage } from "./TextMessage";

interface WorkspaceChatColumnProps {
    planId: string;
    profile: any;
}

export function WorkspaceChatColumn({ planId, profile }: WorkspaceChatColumnProps) {
    const [messageInput, setMessageInput] = useState("");
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const { data: messagesResponse, isLoading } = useJobPlanMessages(planId);
    const sendMessageMutation = useSendMessage();
    const recallMessageMutation = useRecallMessage();
    const deleteMessageMutation = useDeleteMessageForMe();
    const uploadFileMutation = useUploadFile();
    const uploadImageMutation = useUploadImage();
    const uploadPdfMutation = useUploadPdf();

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    const messages = messagesResponse?.data || [];

    const handleSendMessage = async () => {
        if (!messageInput.trim() && !uploadFileMutation.isPending) return;

        try {
            await sendMessageMutation.mutateAsync({
                id: planId,
                data: {
                    content: messageInput.trim(),
                    type: "text",
                    replyToId: replyingTo?._id,
                    senderName: profile?.fullName || profile?.employeeName
                }
            });
            setMessageInput("");
            setReplyingTo(null);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const processFileUpload = async (file: File, type: "file" | "image", uploadMutation: any) => {
        try {
            const res = await uploadMutation.mutateAsync(file);
            const fileUrl = res?.data?.fileUrl || res?.data?.url || res?.url;

            if (!fileUrl) return;

            await sendMessageMutation.mutateAsync({
                id: planId,
                data: {
                    content: type === "image" ? `Đã gửi ảnh: ${file.name}` : `Đã gửi tệp: ${file.name}`,
                    type: type,
                    fileUrl: fileUrl,
                    fileMetadata: {
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type
                    },
                    replyToId: replyingTo?._id,
                    senderName: profile?.fullName || profile?.employeeName
                }
            });
            setReplyingTo(null);
        } catch (error) {
            console.error(`Upload/Send ${type} failed:`, error);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFileUpload(file, "file", uploadFileMutation).finally(() => e.target.value = "");
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFileUpload(file, "image", uploadImageMutation).finally(() => e.target.value = "");
    };

    const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFileUpload(file, "file", uploadPdfMutation).finally(() => e.target.value = "");
    };

    const handleRecall = (messageId: string) => {
        recallMessageMutation.mutate({ id: planId, messageId });
    };

    const handleDeleteForMe = (messageId: string) => {
        deleteMessageMutation.mutate({ id: planId, messageId });
    };

    // Tự động cuộn xuống khi có tin nhắn mới
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const MessageContent = ({ msg, isMe, isRecalled }: { msg: any, isMe: boolean, isRecalled: boolean }) => {
        if (isRecalled) {
            return (
                <div className="p-3 rounded-xl text-base border bg-darkBackgroundV2 border-darkBorderV1 text-neutral-400 italic font-light">
                    Tin nhắn đã được thu hồi
                </div>
            );
        }

        switch (msg.type) {
            case "image":
                return <ImageMessage msg={msg} isMe={isMe} replyTo={msg.replyTo} />;
            case "file":
                return <FileMessage msg={msg} isMe={isMe} replyTo={msg.replyTo} />;
            case "text":
            default:
                return <TextMessage content={msg.content} isMe={isMe} replyTo={msg.replyTo} />;
        }
    };

    return (
        <div className="w-[60%] flex flex-col bg-darkCardV1 h-[650px] custom-scrollbar">
            <div className="h-14 p-3 border-b border-darkBorderV1 shrink-0 bg-accent/50 flex items-center">
                <div className="flex items-center gap-2 text-accent">
                    <Icon path={mdiFacebookMessenger} size={0.8} className="text-white" />
                    <span className="font-semibold text-sm text-white">Thảo luận công việc</span>
                </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                <div className="space-y-4 pt-2">
                    {messages.length > 0 ? (
                        messages.map((msg: any) => {
                            const isMe = msg.sender === profile?.id;
                            const isRecalled = msg.isRecalled;

                            return (
                                <div
                                    key={msg._id}
                                    className={`flex flex-col gap-1 max-w-[90%] ${isMe ? "ml-auto items-end" : "mr-auto group"}`}
                                >
                                    {/* Sender Info */}
                                    <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                        <div className="size-10 rounded-full flex-shrink-0 border border-darkBorderV1 p-0.5 bg-darkBackgroundV1">
                                            <img
                                                src={msg.senderAvatar || `https://api.dicebear.com/9.x/bottts/svg?seed=${msg.senderName}`}
                                                alt="Avatar"
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-400">
                                            {isMe ? (profile?.fullName || profile?.employeeName || "Bạn") : msg.senderName}
                                        </span>
                                    </div>


                                    {/* Message Content Area */}
                                    <div className={`flex items-start gap-1 ${isMe ? "flex-row-reverse" : ""}`}>
                                        <div className={`relative group/msg min-w-[60px] max-w-full`}>
                                            <MessageContent msg={msg} isMe={isMe} isRecalled={isRecalled} />

                                            {/* Quick Actions (Reply) */}
                                            {!isRecalled && (
                                                <div className={`absolute top-0 opacity-0 group-hover/msg:opacity-100 transition-opacity flex gap-1 items-center px-2 py-1 ${isMe ? "right-full mr-1" : "left-full ml-1"}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="!size-9 rounded-full"
                                                        onClick={() => setReplyingTo(msg)}
                                                    >
                                                        <Icon path={mdiReply} size={0.8} />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="!size-9 rounded-full"
                                                            >
                                                                <Icon path={mdiDotsVertical} size={0.8} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align={isMe ? "end" : "start"}>
                                                            {isMe && !isRecalled && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleRecall(msg._id)}
                                                                >
                                                                    <Icon path={mdiBackupRestore} size={0.8} />
                                                                    Thu hồi
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteForMe(msg._id)}
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} />
                                                                Xóa phía tôi
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <span className={`text-sm text-neutral-400 px-1 font-medium ${isMe ? "mr-1 text-right" : "ml-1"}`}>
                                        {formatDateWithTime(msg.createdAt)}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
                            <Icon path={mdiFacebookMessenger} size={2.5} />
                            <p className="italic text-base">Chưa có thảo luận nào cho phương án này.</p>
                        </div>
                    )}
                    <div ref={scrollRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-darkBorderV1 bg-darkCardV1/80 flex flex-col gap-2 shrink-0">
                {/* Replying Status Box */}
                {replyingTo && (
                    <div className="flex items-center justify-between bg-accent/5 border border-accent/10 p-3 rounded-lg text-sm text-neutral-400 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 truncate">
                            <Icon path={mdiReply} size={0.8} className="text-accent" />
                            <span className="truncate">Đang trả lời <strong className="text-accent">@{replyingTo.senderName}</strong>: {replyingTo.content}</span>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="text-neutral-400 hover:text-white transition-colors">
                            <Icon path={mdiClose} size={0.6} />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadImageMutation.isPending}
                    >
                        <Icon path={mdiImagePlus} size={0.8} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={uploadPdfMutation.isPending}
                    >
                        <Icon path={mdiFileDocumentPlus} size={0.8} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                    >
                        <Icon path={mdiStickerEmoji} size={0.8} />
                    </Button>
                    <Input
                        placeholder={uploadFileMutation.isPending || uploadImageMutation.isPending || uploadPdfMutation.isPending ? "Đang tải tệp..." : "Nhập tin nhắn..."}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        disabled={uploadFileMutation.isPending || uploadImageMutation.isPending || uploadPdfMutation.isPending}
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending || (!messageInput.trim() && !uploadFileMutation.isPending && !uploadImageMutation.isPending && !uploadPdfMutation.isPending)}
                    >
                        Gửi
                        <Icon path={mdiSend} size={0.8} />
                    </Button>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
            />
            <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />
            <input
                type="file"
                ref={pdfInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handlePdfUpload}
            />
        </div>
    );
}
