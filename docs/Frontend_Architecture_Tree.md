# Cấu trúc Cây thư mục Frontend (BadmintonHub-FE2)

Kiến trúc thư mục của dự án Frontend tuân thủ nghiêm ngặt theo chuẩn Next.js 15 App Router và mô hình Feature-sliced design (chia nhỏ thư mục theo tính năng).

```text
BadmintonHub-FE2/
│
├── public/                 # Chứa các tài nguyên tĩnh (images, icons, fonts)
│
├── src/                    # Thư mục gốc chứa mã nguồn chính
│   │
│   ├── api/                # Nơi định nghĩa các API Client (Axios) và cấu hình gọi endpoint
│   │   ├── auth.ts
│   │   ├── venue.ts
│   │   └── ...
│   │
│   ├── app/                # Next.js App Router (Định nghĩa các trang và hệ thống định tuyến)
│   │   ├── admin/          # Routes dành riêng cho Quản trị viên (Admin)
│   │   ├── owner/          # Routes dành riêng cho Chủ sân (Owner)
│   │   ├── venues/         # Route tìm kiếm và xem chi tiết sân
│   │   ├── profile/        # Route trang cá nhân người dùng
│   │   ├── layout.tsx      # Root Layout tổng (Global wrapper)
│   │   └── page.tsx        # Trang chủ (Landing Page)
│   │
│   ├── components/         # Các thành phần giao diện (UI Components)
│   │   ├── ui/             # Các component cơ sở từ Shadcn UI (Button, Input, Card, Dialog...)
│   │   ├── auth/           # Component liên quan đến đăng nhập, đăng ký, bảo vệ Router (Protected Route)
│   │   ├── layout/         # Component bộ khung như Header, Footer, Sidebar, Navigation
│   │   ├── Landing/        # Các phân khu cho trang chủ (Hero Banner, Features, AI Suggestion)
│   │   ├── Venues/         # Component chuyên biệt hiển thị sân (Bản đồ Map, Danh sách, Thẻ sân)
│   │   └── AdminDashboard/ # Các component thống kê riêng cho Admin/Owner
│   │
│   ├── context/            # React Context (Ví dụ: useUserContext.tsx quản lý state đăng nhập toàn cục)
│   │
│   ├── hooks/              # Custom React Hooks (Sử dụng TanStack React Query để fetch/cache dữ liệu)
│   │   ├── useVenue.ts     
│   │   ├── useBooking.ts
│   │   └── ...
│   │
│   ├── interface/          # Định nghĩa kiểu dữ liệu TypeScript (DTO, Models) đồng bộ với Backend
│   │   ├── auth.ts
│   │   ├── venue.ts
│   │   ├── booking.ts
│   │   └── admin.ts
│   │
│   ├── lib/                # Chứa các hàm tiện ích (Utils), cấu hình thư viện chung
│   │   ├── utils.ts        # Hàm nối class (tailwind-merge, clsx)
│   │   └── tokenStorage.ts # Xử lý lưu trữ Access Token vào LocalStorage/Cookies an toàn
│   │
│   └── stores/             # Cấu hình Zustand (Quản lý các trạng thái state nhỏ gọn, độc lập)
│
├── .env                    # File cấu hình biến môi trường (Backend URL, Map API Key)
├── next.config.mjs         # Cấu hình cốt lõi của Next.js (Turbopack, Image domains)
├── tailwind.config.ts      # Cấu hình Styling hệ thống (Màu sắc, Font chữ, Animation)
├── tsconfig.json           # Cấu hình trình biên dịch TypeScript
└── package.json            # Quản lý danh sách thư viện (Dependencies) và các script (pnpm run)
```

### Ưu điểm của cấu trúc này:
1. **Dễ bảo trì (Maintainable):** Mã nguồn chia tách rõ ràng (logic lấy dữ liệu nằm ở `api`/`hooks`, giao diện hiển thị nằm ở `components`).
2. **Khả năng tái sử dụng (Reusability):** Thư mục `components/ui` chứa các khối xếp hình cơ bản để tái sử dụng mọi nơi mà không bị lặp code.
3. **An toàn kiểu dữ liệu (Type-safety):** Mọi object đổ về từ API đều phải ánh xạ qua thư mục `interface` giúp VSCode có thể nhắc lệnh tự động.
