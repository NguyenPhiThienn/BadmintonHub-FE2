# Quy định Thiết kế & Phát triển UI

Tài liệu này tóm tắt các quy chuẩn về giao diện (UI) và cách viết code CSS/Component để đảm bảo tính đồng nhất cho dự án BadmintonHub.

## 1. Quy định về Dialog (Cấu trúc, Header, Footer)
Các Dialog trong dự án phải tuân thủ cấu trúc và quy chuẩn sau để đảm bảo tính đồng nhất:

### A. Cấu trúc tổng thể & Kích thước
- **Kích thước**: Chỉ sử dụng `size="medium"` (mặc định cho hầu hết trường hợp) hoặc `size="small"`. Tuyệt đối không sử dụng `size="large"` hoặc tùy chỉnh `className` để thay đổi kích thước `DialogContent`.
- **Scroll**: Phần nội dung phải có `max-h-[70vh]` và `overflow-y-auto` với class `custom-scrollbar`.

### B. Dialog Header
- Phải sử dụng class `text-accent` cho `DialogTitle`.
- Bắt buộc có **Icon** đi kèm với `size={0.8}` nhấn mạnh chức năng của Dialog.

### C. Dialog Footer
- Không sử dụng `className` cho `DialogFooter`.
- Các nút bấm phải tuân thủ quy tắc của component `Button`.

### D. Mẫu Code chuẩn
```tsx
<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent size="medium">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-accent">
                <Icon path={mdiClipboardCheckOutline} size={0.8} />
                <span>Tiêu đề Dialog</span>
            </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
           {/* Nội dung Dialog đặt tại đây */}
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isPending}>
                <Icon path={mdiClose} size={0.8} />
                Đóng
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
                <Icon path={mdiContentSave} size={0.8} />
                Lưu thay đổi
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

## 2. Quy định về Header của Card (CardHeader)
Các `CardHeader` cần có đường kẻ viền dưới và sử dụng màu text/icon là `accent`:
```tsx
<CardHeader className="border-b border-b-darkBorderV1 py-3">
    <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-accent" />
        <span className="font-semibold text-accent">
            Thông tin tài xế & Xe
        </span>
    </div>
</CardHeader>
```

## 3. Quy định về Đường phân cách tiêu đề của các Section (Dashed Line Divider)
Đối với các tiêu đề mục nhỏ bên trong trang hoặc dialog, sử dụng đường kẻ đứt (`dashed line`) để phân tách, phải chuẩn như styling, format dưới đây, không được tùy chỉnh bậy bạ:
```tsx
<div className="flex items-center gap-3 md:gap-4">
    <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
    <div className="flex-1 border-b border-dashed border-accent mr-1" />
</div>
```

## 4. Quy định về Trạng thái trống (Empty States)
Khi không có dữ liệu để hiển thị (Empty state), **BẮT BUỘC** sử dụng cấu trúc `div` với bộ `className` chuẩn duy nhất dưới đây. TUYỆT ĐỐI không được tùy chỉnh màu sắc, font-size hay các thuộc tính layout khác. AI khi thực hiện code phải tự động áp dụng đúng mẫu này:

```tsx
<div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" /> {/* Thay thế icon MDI phù hợp với ngữ cảnh */}
    Không tìm thấy công ty. {/* Thay thế nội dung thông báo phù hợp */}
</div>
```

*Lưu ý: Nếu nằm trong Table, hãy đặt `div` này bên trong `TableCell`.*

## 5. Quy định về Tiêu đề Bảng (Table Headers)
Tiêu đề bảng cần gọn gàng, không sử dụng className cho TableRow (của Header) và TableHead, không lạm dụng định nghĩa chiều rộng (width) trừ khi thực sự cần thiết, cứ clean như mẫu dưới đây là được vì trong components/ui/table.tsx đã có định nghĩa sẵn. Thường sẽ được căn lề trái, ngoại trừ các cột đặc trưng như "STT":
```tsx
<TableHeader>
    <TableRow>
        <TableHead>STT</TableHead>
        <TableHead>Mã nhân viên</TableHead>
        <TableHead>Họ và Tên</TableHead>
        <TableHead>Ngày sinh</TableHead>
        <TableHead>Quê quán</TableHead>
        <TableHead>Số điện thoại</TableHead>
        <TableHead>Phòng ban</TableHead>
        <TableHead>Chức vụ</TableHead>
        <TableHead>Trạng thái</TableHead>
        <TableHead>Thao tác</TableHead>
    </TableRow>
</TableHeader>
```

## 6. Quy định về Badges
Các component Badge không được sử dụng `className` để tùy chỉnh styling (màu sắc, kích thước, padding, v.v.). Chỉ sử dụng các `variant` đã được định nghĩa sẵn trong `components/ui/badge.tsx` để đảm bảo tính nhất quán:
```tsx
<Badge variant="green">Hoạt động</Badge>
<Badge variant="orange">Chờ xử lý</Badge>
<Badge variant="red">Quá hạn</Badge>
```

## 7. Quy định về Form (Label, Input, Textarea)
Tuyệt đối không được thêm `className` vào `Input`, `Label` và `Textarea` để tùy chỉnh styling (như màu sắc, độ đậm, biên, v.v.) vì đã có định nghĩa mặc định đồng nhất trong hệ thống (chỉ ngoại trừ một số class padding thiết yếu do cấu trúc đặc biệt):
```tsx
<div className="space-y-1">
    <Label htmlFor="username">Tên người dùng</Label>
    <Input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Nhập tên người dùng"
    />
</div>
```

## 8. Quy định về Button
Các nút bấm cần tuân thủ các quy tắc sau để đảm bảo tính thẩm mỹ và nhất quán:
- **Bắt buộc có Icon**: Các Button (trừ Button size="icon") phải có **mdi-icon** với `size={0.8}` đặt phía trước text, icon phải tương ứng với chức năng/nội dung của Button.
- **Không tùy chỉnh styling cho Button**: Tuyệt đối không được thêm `className` vào `Button` để chỉnh màu sắc, shadow, font-weight, v.v. (đã được handle trong `variant`). Chỉ cho phép sử dụng các class layout như: `w-full`, `flex-shrink-0`, `flex-1`.
- **Sử dụng Variant**: Luôn sử dụng các `variant` đã được custom (ví dụ: `variant="accent"`, `variant="outline"`, `variant="ghost"`, v.v.).
- **Không styling cho Icon**: Tuyệt đối không sử dụng `className` hoặc `style` cho component `Icon` bên trong Button. Spacing sẽ được xử lý tự động.
- **Kích thước (Size)**: Không sử dụng `size="sm"`. Chỉ sử dụng kích thước mặc định hoặc `size="icon"` cho các nút dạng vuông.
- **Thao tác trong bảng**: Các nút trong cột "Thao tác" của bảng phải sử dụng `size="icon"` và bắt buộc phải có `Tooltip` bao quanh.

```tsx
// Nút bình thường (Bắt buộc có icon size 0.8)
<Button variant="accent" onClick={handleSave}>
    <Icon path={mdiContentSave} size={0.8} />
    Lưu dữ liệu
</Button>

// Nút layout w-full
<Button variant="accent" className="w-full" onClick={handleAction}>
    <Icon path={mdiEye} size={0.8} />
    Xem chi tiết
</Button>

// Nút có trạng thái loading
<Button type="submit" disabled={isPending}>
    {isPending ? (
        <Icon path={mdiLoading} size={0.8} />
    ) : (
        <Icon path={mdiPlus} size={0.8} />
    )}
    Lưu thay đổi
</Button>
```

## 9. Quy định về Kích thước chữ (Font Size)
Cấm tuyệt đối việc sử dụng `text-xs`, `text-xs`, nhỏ nhất phải là `text-xs`.

## 10. Quy định về Kích thước Icon (Icon Size)
Tuyệt đối **CHỈ SỬ DỤNG** 2 kích thước icon sau cho toàn bộ dự án:
- `size={0.8}`: Kích thước tiêu chuẩn cho các nút bấm, tiêu đề, và thông tin chính.
- `size={0.6}`: Kích thước nhỏ khi cần hiển thị icon trong không gian hẹp (phụ đề, danh sách con).
- **Cấm tuyệt đối** việc sử dụng các size khác (0.7, 0.75, 0.9, v.v.).

## 11. Quy định về Bảng được bọc trong Card (Tables in Cards)
Khi sử dụng `Card` để bọc các thành phần `Table` bên trong (thường dùng trong Dialog hoặc các Section nhỏ), bắt buộc phải sử dụng bộ `className` chuẩn sau để đảm bảo spacing và hiển thị đồng nhất:
```tsx
<Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
    <Table>
        ...
    </Table>
</Card>
```

## 12. Quy định về Ô nhập mật khẩu (Password Input with Toggle)
Các ô nhập mật khẩu phải có chức năng ẩn/hiện mật khẩu sử dụng icon `mdiEye` và `mdiEyeOff`. Luôn sử dụng cấu trúc `relative` để đặt nút bấm icon vào bên phải của ô nhập:

```tsx
<div className="relative">
    <Input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        className="pr-10" // Bắt buộc phải có để text không đè lên icon
    />
    <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-accent transition-colors"
    >
        <Icon path={showPassword ? mdiEyeOff : mdiEye} size={0.8} className="flex-shrink-0" />
    </button>
</div>
```

## 13. Quy định về Màu sắc Text (Text Colors)
Màu sắc của text **BẮT BUỘC** chỉ được sử dụng các class sau để duy trì tính đồng nhất. Cấm tuyệt đối việc sử dụng các mã màu HEX tự phát hoặc các class màu khác không có trong danh sách:
- **`text-accent`**: Dùng cho các tiêu đề quan trọng, các phần cần nhấn mạnh hoặc các trạng thái chủ đạo.
- **`text-neutral-300`**: Dùng cho nội dung văn bản chính, thông tin chi tiết.
- **`text-neutral-400`**: Dùng cho các đoạn văn bản phụ, ghi chú, placeholder hoặc thông tin ít quan trọng hơn.
- **`text-white`**: Chỉ dùng khi thực sự cần độ tương phản cao nhất trên nền tối.

## 14. Quy định về sử dụng màu sắc
Hiện tại giao diện đang sử dụng Dark Mode (không sử dụng light mode), nên các màu sắc chỉ sử dụng các màu đã config sau: text-neutral-400, text-neutral-300 và các màu đã được config như accent, darkBorderV1, darkBackgroundV1, darkCardV1

## 15. Quy định về Đơn vị Spacing (Gap, Padding, Margin, Space)
Để đảm bảo nhịp điệu thị giác (visual rhythm) đồng nhất, dự án chỉ sử dụng các đơn vị chia hết cho 4 cho các thuộc tính spacing. Cụ thể:
- **ĐƠN VỊ DUY NHẤT**: Chỉ sử dụng `gap-4`, `p-4`, `m-4`, `space-x-4`, `space-y-4` (và các biến thể `gap-2`, `p-2` nếu cần không gian hẹp).
- **CẤM TUYỆT ĐỐI**: Không sử dụng các đơn vị như `gap-6`, `p-6`, `space-y-6`, `m-10`, v.v... Nếu cần không gian lớn hơn, hãy sử dụng `gap-8` hoặc `gap-12`. Ưu tiên hàng đầu luôn là **4**.

## 16. Quy định về Ô tìm kiếm (Search Input with Icon)
Tất cả các ô nhập dữ liệu tìm kiếm (Search Input) trong toàn bộ dự án phải tuân thủ đúng cấu trúc `relative` với Icon nằm tuyệt đối (`absolute`) phía bên trái để đảm bảo tính đồng nhất:

```tsx
<div className="relative w-full flex-1 min-w-[300px]">
    <Input
        placeholder="Tìm theo dự án, công trường..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClear={() => setSearchQuery("")}
        className="pl-8 py-2 w-full"
    />
    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
</div>
```
*Lưu ý: Luôn sử dụng `pl-8` (hoặc `pl-9`) cho Input để nội dung không bị đè lên Icon. Icon phải sử dụng các class căn giữa tuyệt đối như mẫu bên trên.*

## 17. Quy định về Kích thước chữ tối thiểu (Minimum Font Size)
Để đảm bảo khả năng đọc (readability) và tính chuyên nghiệp trên mọi thiết bị:
- **KÍCH THƯỚC TỐI THIỂU**: Tuyệt đối không sử dụng các kích thước chữ tùy chỉnh như `text-[10px]`, `text-[11px]`, `text-[12px]`, v.v...
- **CHUẨN**: Kích thước chữ nhỏ nhất được phép sử dụng trong dự án là **`text-sm`**.
- **NGOẠI LỆ**: Chỉ sử dụng `text-xs` trong những trường hợp cực kỳ đặc thù (labels phụ trong không gian quá hẹp), nhưng ưu tiên hàng đầu vẫn là **`text-sm`**.

## 18. Không sử dụng font-bold, font-extrabold, font-black, chỉ sử dụng font-semibold và font-medium