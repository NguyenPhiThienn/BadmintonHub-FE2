import { uploadApi } from "@/api/upload";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useUploadImage = () => {
  return useMutation({
    mutationFn: (file: File) => uploadApi.uploadImage(file),
    onMutate: () => {
      return toast.loading("Đang tải hình ảnh lên...");
    },
    onSuccess: (_, __, toastId) => {
      toast.update(toastId as string, {
        render: "Tải hình ảnh lên thành công",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error: any, _, toastId) => {
      toast.update(toastId as string, {
        render: error?.message || "Tải hình ảnh thất bại",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    },
  });
};

export const useUploadPdf = () => {
  return useMutation({
    mutationFn: (file: File) => {
      const toastId = toast.loading(
        `Đang tải văn bản lên... 0% (0 B / ${formatBytes(file.size)})`,
        { progress: 0 }
      );

      return uploadApi
        .uploadPdfWithProgress(file, (percent, loaded, total) => {
          toast.update(toastId, {
            render: `Đang tải văn bản lên... ${percent}% (${formatBytes(loaded)} / ${formatBytes(total)})`,
            isLoading: true,
            progress: percent / 100,
          });
        })
        .then((data: any) => {
          toast.update(toastId, {
            render: "Tải văn bản lên thành công",
            type: "success",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
          return data;
        })
        .catch((error: any) => {
          toast.update(toastId, {
            render: error?.message || "Tải văn bản thất bại",
            type: "error",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
          throw error;
        });
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: (file: File) => uploadApi.uploadImage(file),
    onMutate: () => {
      return toast.loading("Đang tải file lên...");
    },
    onSuccess: (_, __, toastId) => {
      toast.update(toastId as string, {
        render: "Tải file lên thành công",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error: any, _, toastId) => {
      toast.update(toastId as string, {
        render: error?.message || "Tải file thất bại",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    },
  });
};

export const useDeleteFile = () => {
  return useMutation({
    mutationFn: ({ fileId, type = "image" }: { fileId: string, type?: "image" | "raw" }) =>
      uploadApi.deleteFile(fileId, type),
    onSuccess: () => {
      toast.success("Xóa file thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xóa file thất bại");
    },
  });
};

// ─── Utility ─────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
