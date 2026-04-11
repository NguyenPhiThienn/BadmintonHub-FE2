"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FileRecordCard } from "@/components/ui/FileRecordCard";
import { useUpdateDeviceType } from "@/hooks/useTesting";
import { useUploadPdf } from "@/hooks/useUpload";
import { IDeviceType, IFileRecord } from "@/interface/testing";
import {
    mdiAlertCircle,
    mdiCloudUploadOutline,
    mdiFilePdfBox,
    mdiFileWord,
    mdiLoading,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

interface TemplateUploadProps {
    deviceType: IDeviceType;
}

export const TemplateUpload = ({ deviceType }: TemplateUploadProps) => {
    const wordInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    const [selectedWord, setSelectedWord] = useState<File | null>(null);
    const [selectedPdf, setSelectedPdf] = useState<File | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [uploadType, setUploadType] = useState<"word" | "pdf" | null>(null);

    const { mutate: uploadFile, isPending: isUploading } = useUploadPdf();
    const updateMutation = useUpdateDeviceType();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "word" | "pdf") => {
        const file = e.target.files?.[0];
        if (!file) return;

        const wordExts = [".doc", ".docx"];
        const pdfExts = [".pdf"];

        if (type === "word" && !wordExts.some(ext => file.name.toLowerCase().endsWith(ext))) {
            toast.error("Chỉ chấp nhận file Word (.doc, .docx)");
            return;
        }
        if (type === "pdf" && !pdfExts.some(ext => file.name.toLowerCase().endsWith(ext))) {
            toast.error("Chỉ chấp nhận file PDF (.pdf)");
            return;
        }

        if (type === "word") setSelectedWord(file);
        else setSelectedPdf(file);
    };

    const handleOpenConfirm = (type: "word" | "pdf") => {
        setUploadType(type);
        setIsConfirmOpen(true);
    };

    const handleConfirmUpload = () => {
        const file = uploadType === "word" ? selectedWord : selectedPdf;
        if (!file || !uploadType) return;

        uploadFile(file, {
            onSuccess: (response: any) => {
                const fileData: IFileRecord = {
                    fileUrl: response.data.url,
                    fileName: response.data.originalName || file.name,
                    fileType: response.data.mimeType || file.type,
                    fileSize: response.data.size || file.size
                };

                const updateData = uploadType === "word"
                    ? { templateFile: fileData }
                    : { generatedFile: fileData };

                updateMutation.mutate({
                    id: deviceType._id,
                    data: updateData
                }, {
                    onSuccess: () => {
                        if (uploadType === "word") setSelectedWord(null);
                        else setSelectedPdf(null);
                        setIsConfirmOpen(false);
                    }
                });
            }
        });
    };

    const isPending = isUploading || updateMutation.isPending;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UploadBox
                title="File Word mẫu biên bản"
                icon={mdiFileWord}
                headerColor="bg-[#087BCE]/50"
                inputRef={wordInputRef}
                selectedFile={selectedWord}
                onFileChange={(e) => handleFileChange(e, "word")}
                onRemove={() => setSelectedWord(null)}
                onUpload={() => handleOpenConfirm("word")}
                currentFile={deviceType.templateFile}
                accept=".doc,.docx"
                isPending={isPending}
                uploadText="Nhấn để chọn file Word mẫu (.doc, .docx)"
            />

            <UploadBox
                title="File PDF biên bản sau cấu hình"
                icon={mdiFilePdfBox}
                headerColor="bg-[#E55153]/50"
                inputRef={pdfInputRef}
                selectedFile={selectedPdf}
                onFileChange={(e) => handleFileChange(e, "pdf")}
                onRemove={() => setSelectedPdf(null)}
                onUpload={() => handleOpenConfirm("pdf")}
                currentFile={deviceType.generatedFile}
                accept=".pdf"
                isPending={isPending}
                uploadText="Nhấn để chọn file PDF mẫu (.pdf)"
            />

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmUpload}
                title={`Xác nhận tải lên ${uploadType === "word" ? "file Word" : "file PDF"}`}
                description={`Bạn có chắc chắn muốn cập nhật ${uploadType === "word" ? "file mẫu Word" : "file PDF sau cấu hình"} cho thiết bị này không?`}
                isPending={isPending}
            />
        </div>
    );
};

interface UploadBoxProps {
    title: string;
    icon: string;
    headerColor: string;
    inputRef: React.RefObject<HTMLInputElement>;
    selectedFile: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    onUpload: () => void;
    currentFile?: IFileRecord;
    accept: string;
    isPending: boolean;
    uploadText: string;
}

const UploadBox = ({
    title,
    icon,
    headerColor,
    inputRef,
    selectedFile,
    onFileChange,
    onRemove,
    onUpload,
    currentFile,
    accept,
    isPending,
    uploadText
}: UploadBoxProps) => {
    return (
        <Card className="bg-darkCardV1 border-2 border-darkBorderV1 overflow-hidden shadow-lg flex flex-col">
            <div className={`p-3 ${headerColor} border-b border-white/10 flex items-center gap-2`}>
                <Icon path={icon} size={0.8} className="text-white" />
                <h3 className="text-sm font-bold text-white">{title}</h3>
            </div>

            <div className="p-4 pt-0 flex-1 flex flex-col">
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    accept={accept}
                    onChange={onFileChange}
                />

                <motion.div
                    onClick={() => !isPending && inputRef.current?.click()}
                    className={`
                        relative group cursor-pointer border-2 border-dashed rounded-xl p-4 mb-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 flex-1
                        ${selectedFile
                            ? "border-green-400 bg-green-400/10"
                            : "border-white/30 hover:border-white/60 hover:bg-white/5 bg-white/5"}
                    `}
                >
                    <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-colors
                        ${selectedFile ? "bg-green-400 text-neutral-900 shadow-lg shadow-green-500/20" : "bg-white/20 text-neutral-300 group-hover:bg-white/30"}
                    `}>
                        <Icon
                            path={isPending ? mdiLoading : (selectedFile ? icon : mdiCloudUploadOutline)}
                            size={1.2}
                            className={isPending ? "animate-spin" : ""}
                        />
                    </div>

                    <div className="text-center space-y-1">
                        {selectedFile ? (
                            <>
                                <p className="text-accent font-semibold text-sm">Tệp đã chọn sẵn sàng</p>
                                <p className="text-neutral-400 text-sm truncate max-w-[300px] italic">{selectedFile.name}</p>
                            </>
                        ) : (
                            <p className="text-neutral-400 text-sm font-medium">{uploadText}</p>
                        )}
                    </div>

                    {selectedFile && !isPending && (
                        <div className="flex items-center gap-2 mt-2">
                            <Button
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            >
                                <Icon path={mdiTrashCanOutline} size={0.8} />
                                Gỡ
                            </Button>
                            <Button
                                onClick={(e) => { e.stopPropagation(); onUpload(); }}
                            >
                                <Icon path={mdiCloudUploadOutline} size={0.8} />
                                Tải lên
                            </Button>
                        </div>
                    )}
                </motion.div>

                <div className="mt-auto">
                    {currentFile?.fileUrl ? (
                        <FileRecordCard
                            fileName={currentFile.fileName}
                            fileUrl={currentFile.fileUrl}
                            fileType={currentFile.fileType}
                            fileSize={currentFile.fileSize}
                            createdAt={currentFile.createdAt}
                            showDelete={false}
                        />
                    ) : (
                        <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg border border-white/20 backdrop-blur-sm">
                            <Icon path={mdiAlertCircle} size={0.8} className="text-amber-300" />
                            <span className="text-sm text-neutral-300 font-medium italic">Chưa cấu hình tệp mẫu.</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
