import { Badge } from "@/components/ui/badge";

export function getRoleBadge(role: string) {
  switch (role.toLowerCase()) {
    case "admin":
      return (
        <Badge variant="cyan" className="capitalize">
          Admin
        </Badge>
      );
    case "dispatcher":
      return (
        <Badge variant="orange" className="capitalize">
          Điều phối viên
        </Badge>
      );
    case "customer":
      return (
        <Badge variant="blue" className="capitalize">
          Khách hàng
        </Badge>
      );
    case "driver":
      return (
        <Badge variant="emerald" className="capitalize">
          Tài xế
        </Badge>
      );
    default:
      return (
        <Badge variant="slate" className="capitalize">
          {role}
        </Badge>
      );
  }
}

export function getStatusBadge(status: string) {
  switch (status) {
    // Account / General Statuses
    case "APPROVED":
      return (
        <Badge variant="green" className="capitalize">
          Đã duyệt
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="amber" className="capitalize">
          Chờ duyệt
        </Badge>
      );
    case "LOCKED":
      return (
        <Badge variant="gray" className="capitalize">
          Đã khóa
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="red" className="capitalize">
          Từ chối
        </Badge>
      );

    // Ticket Statuses
    case "OPEN":
      return (
        <Badge variant="blue" className="capitalize">
          Đang mở
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="amber" className="capitalize">
          Đang xử lý
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge variant="green" className="capitalize">
          Đã giải quyết
        </Badge>
      );

    case "CLOSED":
      return (
        <Badge variant="slate" className="capitalize">
          Đã đóng
        </Badge>
      );

    default:
      return (
        <Badge variant="slate" className="capitalize">
          {status}
        </Badge>
      );
  }
}

export function getOrderStatusBadge(status: string) {
  switch (status) {
    // 1. Order Process Statuses
    case "PENDING":
      return (
        <Badge variant="amber" className="capitalize">
          Đang chờ
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge variant="blue" className="capitalize">
          Đã chấp nhận
        </Badge>
      );
    case "PICKED_UP":
      return (
        <Badge variant="indigo" className="capitalize">
          Đã lấy hàng
        </Badge>
      );
    case "DELIVERED":
      return (
        <Badge variant="green" className="capitalize">
          Đã giao hàng
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="red" className="capitalize">
          Đã hủy
        </Badge>
      );

    // 2. Payment Statuses
    case "UNPAID":
      return (
        <Badge variant="orange" className="capitalize">
          Chưa thanh toán
        </Badge>
      );
    case "PAID":
      return (
        <Badge variant="green" className="capitalize">
          Đã thanh toán
        </Badge>
      );

    // 3. Payment Methods
    case "CASH":
      return (
        <Badge variant="slate" className="capitalize">
          Tiền mặt
        </Badge>
      );
    case "WALLET":
      return (
        <Badge variant="cyan" className="capitalize">
          Ví điện tử
        </Badge>
      );

    default:
      return (
        <Badge variant="slate" className="capitalize">
          {status}
        </Badge>
      );
  }
}
