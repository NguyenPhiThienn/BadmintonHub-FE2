import { sendDelete, sendGet, sendPost, sendPut } from "./axios";

export const equipmentApi = {
    // 3A: Equipment List
    getEquipment: (params: any) => sendGet("/equipment", params),
    getEquipmentDetails: (id: string) => sendGet(`/equipment/${id}`),
    searchEquipment: (params: any) => sendGet("/equipment/search", params),
    getAvailableEquipment: () => sendGet("/equipment/available"),
    createEquipment: (data: any) => sendPost("/equipment", data),
    updateEquipment: (id: string, data: any) => sendPut(`/equipment/${id}`, data),
    deleteEquipment: (id: string) => sendDelete(`/equipment/${id}`),
    getEquipmentMetadata: () => sendGet("/equipment/metadata"),

    // 3B: Equipment History / Inspection
    updateHistory: (id: string, data: any) => sendPut(`/equipment/${id}`, data),
    deleteHistoryItem: (id: string, historyIndex: number) => sendDelete(`/equipment/${id}/history/${historyIndex}`),
    getInspectionDue: (days: number = 30) => sendGet("/equipment/inspection-due", { days }),


    // 3C: Borrow & Return
    createBorrow: (data: any) => sendPost("/borrow-return", data),
    getBorrowRecords: (params: any) => sendGet("/borrow-return", params),
    checkConflict: (params: any) => sendGet("/borrow-return/check-conflict", params),
    getCurrentlyBorrowed: () => sendGet("/borrow-return/borrowed"),
    searchBorrowRecords: (params: any) => sendGet("/borrow-return/search", params),
    getBorrowDetails: (id: string) => sendGet(`/borrow-return/${id}`),
    updateReturn: (id: string, data: any) => sendPut(`/borrow-return/${id}`, data),
    uploadBorrowImage: (id: string, data: { imageType: "borrow" | "return"; imageUrl: string }) =>
        sendPost(`/borrow-return/${id}/upload-image`, data),
    exportBorrowRecord: (id: string) => sendGet(`/borrow-return/${id}/export`),
    printBorrowRecord: (id: string) => sendGet(`/borrow-return/${id}/print`),
    storekeeperSign: (id: string) => sendPut(`/borrow-return/${id}/storekeeper-sign`),
    unitHeadSign: (id: string) => sendPut(`/borrow-return/${id}/unit-head-sign`),
    technicalStaffSign: (id: string) => sendPut(`/borrow-return/${id}/technical-staff-sign`),
    deleteBorrowRecord: (id: string) => sendDelete(`/borrow-return/${id}`),

    // 3D: Inventory Check
    getInventoryChecks: (params: any) => sendGet("/inventory-check", params),
    getInventoryCheckDetails: (id: string) => sendGet(`/inventory-check/${id}`),
    createInventoryCheck: (data: any) => sendPost("/inventory-check", data),
    deleteInventoryCheck: (id: string) => sendDelete(`/inventory-check/${id}`),
    printInventoryCheck: (id: string) => sendGet(`/inventory-check/${id}/print`),
};
