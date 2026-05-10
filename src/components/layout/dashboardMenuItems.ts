import { MenuItem } from "@/interface/types";
import {
  mdiAccountCircleOutline,
  mdiAccountGroupOutline,
  mdiAccountMultipleOutline,
  mdiCalendarClock,
  mdiSoccerField,
  mdiViewDashboardOutline
} from "@mdi/js";

export const getDashboardMenuItems = (permissions: string[] = [], role?: string): MenuItem[] => {
  const userRole = role?.toUpperCase();

  if (userRole === "COURT_OWNER" || userRole === "OWNER") {
    return [
      {
        id: "owner-dashboard",
        name: "Tổng quan",
        path: "/owner/dashboard",
        icon: mdiViewDashboardOutline,
      },
      {
        id: "owner-venues",
        name: "Quản lý cơ sở",
        path: "/owner/venues",
        icon: mdiSoccerField,
      },
      {
        id: "owner-bookings",
        name: "Quản lý đơn đặt sân",
        path: "/owner/bookings",
        icon: mdiCalendarClock,
      },
      {
        id: "owner-customers",
        name: "Quản lý khách hàng",
        path: "/owner/customers",
        icon: mdiAccountMultipleOutline,
      },
      {
        id: "owner-profile",
        name: "Quản lý cá nhân",
        path: "/owner/profile",
        icon: mdiAccountCircleOutline,
      }
    ];
  }

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
