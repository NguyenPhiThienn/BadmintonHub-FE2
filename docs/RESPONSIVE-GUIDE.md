# 📱 Hướng dẫn Triển khai Responsive (Mô hình Cô lập - Isolated Pattern)

Tài liệu này quy chuẩn hóa phương pháp thêm tính năng Responsive cho Mobile và Tablet trong dự án Company CMS mà **không làm ảnh hưởng đến giao diện Desktop hiện có**.

---

## ⚠️ NGUYÊN TẮC TỐI CAO (Đọc trước mọi thứ)

> **TUYỆT ĐỐI KHÔNG tự bịa/tạo ra bất kỳ nội dung hoặc thành phần nào mới nếu Desktop đã có sẵn.**

- ❌ Tuyệt đối **KHÔNG ĐƯỢC THAY ĐỔI** bất kỳ code hay style nào của giao diện Desktop (Desktop UI) hiện có.
- ❌ Tuyệt đối **CHỈ SỬ DỤNG** 3 màu text sau: `text-neutral-300`, `text-neutral-400`, và `text-primary`. Cấm mọi màu text khác (neutral-300, 500, white, v.v.).
- ❌ Không tự đặt tên thương hiệu, text thông báo hay logo mới if Desktop Không có.
- ❌ Không hardcode data nếu data đó đã được cung cấp từ hàm/hook sẵn có (ví dụ: `getDashboardMenuItems`).
- ❌ Không tạo component/section UI mới (Header, Sidebar) nếu Desktop đã có — hãy dùng lại.
- ❌ Tuyệt đối **KHÔNG TỰ BỊA** các thuộc tính dữ liệu (ví dụ: `fullName`, `email`) mà interface không có. Phải xem kỹ `IUser`, `IEmployee` và cách Desktop đang hiển thị.
- ❌ Tuyệt đối **KHÔNG VIẾT LẠI** logic của các UI component chuẩn (ví dụ: phải dùng `DrawerTrigger`, `DrawerClose` có sẵn của dự án, không tự quản lý state mở/đóng thủ công nếu không cần thiết).
- ✅ Luôn tách biệt code thành 3 View riêng. Chỉ viết mới/chỉnh sửa trong `TabletView` và `MobileView`.
- ✅ Chỉ thay đổi **layout/styling** trong view mới — giữ nguyên **nội dung/logic** và **cấu trúc dữ liệu** của Desktop.
- ✅ Kiểm tra kỹ Hierarchy: Đảm bảo các component con (`DrawerTrigger`, `DrawerContent`) nằm đúng trong context của component cha (`Drawer`).
- ❌ Tuyệt đối **CHỈ SỬ DỤNG** 2 kích thước icon: `size={0.8}` (mặc định) và `size={0.6}` (cho các icon cần nhỏ). Cấm mọi kích thước khác.

---

## 1. Kiến trúc Cốt lõi: Chia để trị (Isolated Responsibilities)

Chúng ta sử dụng **Mô hình 3 Chế độ xem (3-View Component Model)**.

```tsx
export default function YourComponent() {
  const { isMobile, isTablet } = useResponsive();

  // 1. Dữ liệu và Logic — DÙNG CHUNG, không duplicate
  const { data, isLoading } = useYourDataHook();
  const handlers = { ... };

  // 2. Trả về kết quả theo màn hình
  if (isMobile) return <MobileView data={data} {...handlers} />;
  if (isTablet) return <TabletView data={data} {...handlers} />;
  return <DesktopView data={data} {...handlers} />;
}
```

---

## 2. Các Quy tắc Triển khai

### A. Cô lập không phá hủy
- **KHÔNG** chỉnh sửa JSX của Desktop. Di chuyển `return` hiện tại vào `function DesktopView()`.

### B. Tái sử dụng hoàn toàn: Component, Data, Logic

| Loại | Desktop có gì | Mobile/Tablet phải làm |
| :--- | :--- | :--- |
| **Header** | `<CommonHeader />` | Dùng `<CommonHeader />` — **không tạo header mới** |
| **Navigation data** | `getDashboardMenuItems(permissions)` | Gọi cùng hàm đó — **không hardcode mảng mới** |
| **Profile/User data** | `const { profile } = useUser()` | Dùng cùng hook `useUser()` |
| **Assets/Images** | `banner.webp`, logo, icons | Dùng lại cùng đường dẫn assets |
| **UI Components** | `Badge`, `Button`, `Dialog`, `Icon` | Import và dùng lại — **không tạo bản sao** |
| **Permissions** | `profile?.data?.permissions || []` | Truyền cùng permissions vào cùng hàm filter |

### C. Đồng bộ tính năng
- Nếu Desktop hiển thị sub-menu → Mobile cũng phải có sub-menu (chỉ làm thành accordion).
- Nếu Desktop có 8 cột trong bảng → Mobile phải có đủ 8 thông tin đó (chỉ đổi thành card).

---

## 3. Kiểm tra trước khi commit

Trước khi hoàn thành một file responsive, tự hỏi:
1. **"Text này có trong Desktop không?"** → Nếu không → Xóa đi.
2. **"Data này từ đâu ra?"** → Phải từ hook/function sẵn có, không tự tạo mảng.
3. **"Component này có trong Desktop không?"** → Nếu có → Import lại, không viết mới.
4. **"Logic này giống Desktop không?"** → Nếu khác mà không có lý do → Sai.

---

## 4. Các mẫu thiết kế (Layout Patterns)

| Thành phần | Desktop | Tablet | Mobile |
| :--- | :--- | :--- | :--- |
| **Grid** | `grid-cols-3+` | `grid-cols-2` | `grid-cols-1` |
| **Bảng** | `<Table>` ngang | Bảng thu gọn | **Card-List** |
| **Sidebar** | Sidebar có collapse | Icon-only + tooltip | Drawer từ trái (Hamburger) |
| **Header** | `<CommonHeader />` | `<CommonHeader />` | `<CommonHeader />` |
| **Spacing** | `p-4 / gap-4` | `p-4 / gap-3 md:gap-4` | `p-3 / gap-3` |

---

## 5. Ví dụ Code (Bảng → Thẻ)

### Desktop (không được chỉnh sửa)
```tsx
<TableRow>
  <TableCell>{item.name}</TableCell>
  <TableCell><Badge>{item.status}</Badge></TableCell>
</TableRow>
```

### Mobile (chỉ styling lại, dùng cùng data)
```tsx
<div className="bg-darkCardV1 p-3 md:p-4 rounded-xl border border-darkBorderV1 space-y-4 md:space-y-4">
  <div className="flex justify-between items-start">
    <h3 className="font-semibold text-primary">{item.name}</h3>
    {/* Tái sử dụng Badge component — không tạo mới */}
    <Badge variant="status">{item.status}</Badge>
  </div>
  <div className="flex justify-between text-sm">
    <span className="text-neutral-400">Ngày:</span>
    <span className="text-neutral-300">{item.date}</span>
  </div>
</div>
```

---

## 6. Câu lệnh chuẩn cho AI

```
Nâng cấp [Tên Component] cho Mobile/Tablet theo RESPONSIVE-GUIDE.md.
Quy tắc bắt buộc:
1. Dùng <CommonHeader /> — KHÔNG tạo header mới.
2. Dùng getDashboardMenuItems / hook sẵn có — KHÔNG hardcode data.
3. Dùng lại toàn bộ components UI (Badge, Button, Icon, v.v.).
4. Chỉ thay đổi layout/styling — KHÔNG thay đổi nội dung hay logic.
5. Đảm bảo 1:1 feature parity: mọi thông tin của Desktop phải có trên Mobile.
```
