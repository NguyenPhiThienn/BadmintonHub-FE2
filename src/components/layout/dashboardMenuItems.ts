import { MenuItem } from "@/interface/types";
import {
  mdiAccountGroupOutline,
  mdiCalendarClock,
  mdiSoccerField,
  mdiViewDashboardOutline
} from "@mdi/js";

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
      id: "booking-management",
      name: "Quản lý đặt sân",
      path: "/admin/bookings",
      icon: mdiCalendarClock,
    },
  ];

  return allItems;
};
