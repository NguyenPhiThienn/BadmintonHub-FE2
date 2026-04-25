import axios from "axios";
import cookies from "js-cookie";
import { sendDelete, sendPost } from "./axios";

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return sendPost("/upload/image", formData);
  },

  uploadPdf: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return sendPost("/upload/pdf", formData);
  },

  uploadPdfWithProgress: (
    file: File,
    onUploadProgress: (percent: number, loaded: number, total: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      cookies.get("accessToken") ||
      "";

    return axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL || "https://BadmintonHubbe.onrender.com/api/v1"}/upload/pdf`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total ?? file.size;
            const loaded = progressEvent.loaded;
            const percent = Math.round((loaded / total) * 100);
            onUploadProgress(percent, loaded, total);
          },
        }
      )
      .then((res) => res?.data)
      .catch((error) => {
        if (error.response?.data) throw error.response.data;
        throw error;
      });
  },

  deleteFile: (fileId: string, type: "image" | "raw" = "image") =>
    sendDelete(`/upload/${fileId}?type=${type}`),
};
