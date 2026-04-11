import Image from "next/image";

interface StickerMessageProps {
    image: string;
}

export function StickerMessage({ image }: StickerMessageProps) {
    return (
        <div className="relative max-h-24 w-auto mb-2">
            <Image
                src={image}
                alt="Sticker"
                width={0}
                height={0}
                sizes="100vw"
                className="rounded-lg max-h-24 w-auto object-contain"
                style={{
                    width: "auto",
                    height: "auto",
                }}
            />
        </div>
    );
}
