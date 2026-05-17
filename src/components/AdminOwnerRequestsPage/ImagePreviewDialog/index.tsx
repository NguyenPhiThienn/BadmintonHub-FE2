import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import Image from "next/image";

interface ImagePreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    src: string | null;
}

export const ImagePreviewDialog = ({
    isOpen,
    onClose,
    src,
}: ImagePreviewDialogProps) => {
    if (!isOpen || !src) return null;

    return (
        <div
            className="fixed inset-0 z-[1100] bg-black/95 flex items-center justify-center cursor-zoom-out p-4"
            onClick={onClose}
        >
            <div className="relative max-w-5xl w-full h-[85vh]">
                <Image src={src} alt="Large Preview" fill className="object-contain" />
            </div>
            <button
                className="absolute right-4 top-4 bg-darkCardV1 border border-darkBorderV1 rounded-full p-2 text-neutral-300 hover:text-white"
                onClick={onClose}
            >
                <Icon path={mdiClose} size={0.8} />
            </button>
        </div>
    );
};
