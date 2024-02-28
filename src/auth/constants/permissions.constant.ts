export const APP_MODULES = [
    { id: "dashboard", name: "Báo cáo và thống kê" },
    {
        id: "employee-management",
        name: "Quản lý nhân sự",
        subMenu: [
            { id: "employee-management:add", name: "Add" },
            { id: "employee-management:repass", name: "RePass" },
            { id: "employee-management:update", name: "Update" },
            { id: "employee-management:delete", name: "Delete" },
            { id: "employee-management:author", name: "Author" },
        ]
    },
    {
        id: "equipment-management",
        name: "Quản lý dụng cụ",
        subMenu: [
            {
                id: "equipment-list",
                name: "Danh sách dụng cụ",
                actions: [
                    { id: "equipment-list:add", name: "Add" },
                    { id: "equipment-list:update", name: "Update" },
                    { id: "equipment-list:delete", name: "Delete" },
                ]
            },
            {
                id: "equipment-inventory",
                name: "Kiểm kho",
                actions: [
                    { id: "equipment-inventory:add", name: "Add" },
                    { id: "equipment-inventory:delete", name: "Delete" },
                ]
            },
        ]
    },
    {
        id: "work-management",
        name: "Điều hành & chấm công",
        subMenu: [
            {
                id: "task-schedule",
                name: "Lịch làm việc & phân công",
                actions: [
                    { id: "task-schedule:add", name: "Add" },
                    { id: "task-schedule:update", name: "Update" },
                ]
            },
            {
                id: "attendance-management",
                name: "Chấm công & lương",
                actions: [
                    { id: "attendance-management:view-table", name: "ViewTable" },
                ]
            },
        ]
    },
    {
        id: "construction-management",
        name: "Quản lý thi công",
        subMenu: [
            {
                id: "construction-logs",
                name: "Nhật ký thi công",
                actions: [
                    { id: "construction-logs:add", name: "Add" },
                    { id: "construction-logs:update", name: "Update" },
                    { id: "construction-logs:delete", name: "Delete" },
                ]
            },
            {
                id: "construction-plans",
                name: "Phương án thi công",
                actions: [
                    { id: "construction-plans:add", name: "Add" },
                    { id: "construction-plans:update", name: "Update" },
                    { id: "construction-plans:delete", name: "Delete" },
                ]
            },
        ]
    },
    {
        id: "utilities",
        name: "Tiện ích",
        subMenu: [
            {
                id: "partner-management",
                name: "Quản lý đối tác",
                actions: [
                    { id: "partner-management:add", name: "Add" },
                    { id: "partner-management:update", name: "Update" },
                    { id: "partner-management:delete", name: "Delete" },
                ]
            },
            {
                id: "document-management",
                name: "Quản lý văn bản",
                actions: [
                    { id: "document-management:upload", name: "Upload" },
                    { id: "document-management:add", name: "Add" },
                    { id: "document-management:update", name: "Update" },
                    { id: "document-management:delete", name: "Delete" },
                ]
            },
            {
                id: "contract-management",
                name: "Quản lý hợp đồng",
                actions: [
                    { id: "contract-management:add", name: "Add" },
                    { id: "contract-management:update", name: "Update" },
                    { id: "contract-management:delete", name: "Delete" },
                ]
            },
        ]
    },
];
