import {
  mdiAccountGroupOutline,
  mdiAutoFix,
  mdiClipboardCheckOutline,
  mdiCogOutline,
  mdiCommentQuestionOutline,
  mdiSoccerField,
  mdiTagOutline,
  mdiViewDashboardOutline,
} from "@mdi/js";
import { MenuItem } from "@/interface/types";

export const getDashboardMenuItems = (permissions: string[] = [], role?: string): MenuItem[] => {
  const allItems: MenuItem[] = [
    {
      id: "dashboard",
      name: "Bảng điều khiển",
      path: "/admin/dashboard",
      icon: mdiViewDashboardOutline,
    },
    {
      id: "user-management",
      name: "Quản lý người dùng",
      path: "/admin/users",
      icon: mdiAccountGroupOutline,
    },
    {
      id: "venue-management",
      name: "Quản lý cơ sở sân",
      path: "/admin/venues",
      icon: mdiSoccerField,
    },
    {
      id: "order-management",
      name: "Quản lý đơn hàng",
      path: "/admin/promotions",
      icon: mdiTagOutline,
    },
    {
      id: "ai-analytics",
      name: "Phân tích thông minh",
      path: "/admin/ai-analytics",
      icon: mdiAutoFix,
    },
    {
      id: "support-center",
      name: "Trung tâm hỗ trợ",
      path: "/admin/support",
      icon: mdiCommentQuestionOutline,
    },
    {
      id: "system-settings",
      name: "Cấu hình hệ thống",
      path: "/admin/settings",
      icon: mdiCogOutline,
    },
  ];

  return allItems;
};
