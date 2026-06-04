"use client"

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ToastProvider = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastStyle={{
        overflow: "hidden",
        borderRadius: "8px",
        fontSize: "14px",
        background: "#051A1D", // darkCardV1
        color: "#e5e7eb", // text-neutral-300
        fontWeight: 500,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
        padding: "16px 20px",
        minWidth: 320,
        maxWidth: 450,
        border: "1px solid #233738", // darkBorderV1
        alignItems: "center",
        display: "flex",
        gap: "12px",
      }}
      toastClassName={(context) => {
        const type = context?.type || "default";
        return `relative border-l-4 flex items-center shadow-2xl transition-all duration-300 ${type === "success"
          ? "border-l-primary"
          : type === "error"
            ? "border-l-mainDangerV1"
            : type === "warning"
              ? "border-l-mainWarningV1"
              : type === "info"
                ? "border-l-mainInfoV1"
                : "border-l-primary"
          }`;
      }}
    />
  );
};
