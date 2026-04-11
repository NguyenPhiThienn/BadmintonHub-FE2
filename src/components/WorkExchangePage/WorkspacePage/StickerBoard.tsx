"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { stickers } from "@/lib/stickers";
import axios from "axios";
import { Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function StickerBoard({
    userId,
    conversationId,
    setSending,
    setStickerOpen
}: {
    userId: string;
    conversationId: string;
    setSending: (value: boolean) => void;
    setStickerOpen: (value: boolean) => void;
}) {
    const [search, setSearch] = useState("");
    const handleSendSticker = async (stickerUrl: string) => {
        try {
            setSending(true);
            await axios.post(`/api/messages`, {
                conversationId,
                image: stickerUrl,
                content: "",
                senderId: userId,
                type: "sticker",
            });
            setStickerOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };
    return (
        <div className="w-80 bg-background dark:bg-zinc-900 p-0 rounded-sm">
            <div className="p-2 border-b">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Tìm kiếm sticker"
                        className="pl-8 bg-background border"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <ScrollArea className="w-full h-[300px] p-2">
                {stickers.map((pack) => (
                    <div key={pack.id}>
                        <h2 className="text-base font-semibold mb-2 col-span-full text-zinc-600 dark:text-zinc-300">
                            {pack.name}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
                            {pack.value.map((sticker) => (
                                <div
                                    key={sticker.id}
                                    className="aspect-square relative cursor-pointer"
                                    onClick={() => handleSendSticker(sticker.url)}
                                >
                                    <Image
                                        src={sticker.url}
                                        alt={`Sticker ${sticker.id}`}
                                        layout="fill"
                                        objectFit="contain"
                                        className="rounded-lg cursor-pointer"
                                        quality={50}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </ScrollArea>
        </div>
    );
}
