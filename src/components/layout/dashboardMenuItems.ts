import { MenuItem } from "@/interface/types";
import {
  mdiAccountCircleOutline,
  mdiAccountGroupOutline,
  mdiAccountMultipleOutline,
  mdiCalendarClock,
  mdiFinance,
  mdiSoccerField,
  mdiStorefrontOutline,
  mdiTagOutline,
  mdiViewDashboardOutline
} from "@mdi/js";

export const getDashboardMenuItems = (permissions: string[] = [], role?: string, pendingVenuesCount: number = 0): MenuItem[] => {
  const userRole = role?.toUpperCase();

  if (userRole === "OWNER" || userRole === "OWNER") {
    return [
      {
        id: "owner-dashboard",
        name: "Tổng quan",
        path: "/owner",
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
        name: "Danh sách khách hàng",
        path: "/owner/customers",
        icon: mdiAccountMultipleOutline,
      },
      {
        id: "owner-revenue",
        name: "Quản lý doanh thu",
        path: "/owner/revenue",
        icon: mdiFinance,
      },
      {
        id: "owner-coupons",
        name: "Quản lý khuyến mãi",
        path: "/owner/coupons",
        icon: mdiTagOutline,
      },
      {
        id: "owner-profile",
        name: "Quản lý trang cá nhân",
        path: "/owner/profile",
        icon: mdiAccountCircleOutline,
      },
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
      id: "owner-request-management",
      name: "Duyệt đăng ký chủ sân",
      path: "/admin/owner-requests",
      icon: mdiStorefrontOutline,
    },
    {
      id: "venue-management",
      name: "Quản lý cơ sở sân",
      path: "/admin/venues",
      icon: mdiSoccerField,
      badge: pendingVenuesCount > 0 ? pendingVenuesCount : undefined,
      badgeColor: "red",
    },
    {
      id: "booking-management",
      name: "Quản lý đặt sân",
      path: "/admin/bookings",
      icon: mdiCalendarClock,
    },
    {
      id: "revenue-management",
      name: "Quản lý doanh thu",
      path: "/admin/revenue",
      icon: mdiFinance,
    },
  ];

  return allItems;
};
