# Quy định Thiết kế UI bắt buộc chuẩn 100%
## 1. Quy định bắt buộc về Dialog Styling
Các Dialog trong dự án phải tuân thủ cấu trúc và quy chuẩn sau để đảm bảo tính đồng nhất:
```tsx
<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}> 
    <DialogContent size="medium"> // Không được thêm className vào DialogContent, chỉ sử dụng size="medium" hoặc "small"
        <DialogHeader> // Không được thêm className vào DialogHeader
            <DialogTitle className="flex items-center gap-2 text-accent"> // className phải chuẩn như mẫu, không được khác
                <Icon path={mdiClipboardCheckOutline} size={0.8} /> // size icon luôn luôn phải là 0.8
                <span>Tiêu đề Dialog</span> // Không được thêm className
            </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4"> // phần div bọc này không được khác, phải chuẩn 100% như thế này
           {/* Nội dung Dialog đặt tại đây */}
        </div>

        <DialogFooter> // Không được thêm className vào DialogFooter
            <Button variant="outline" onClick={onClose} disabled={isPending}> // Không được thêm className vào Button, chỉ sử dụng varaint
                <Icon path={mdiClose} size={0.8} /> // size icon luôn luôn phải là 0.8
                Đóng
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
                <Icon path={mdiContentSave} size={0.8} /> // size icon luôn luôn phải là 0.8
                Lưu thay đổi
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```


## 2. Quy định về Đường phân cách tiêu đề của các Section (Dashed Line Divider)
Đối với các tiêu đề mục nhỏ bên trong trang hoặc dialog, sử dụng đường kẻ đứt (`dashed line`) để phân tách, phải chuẩn như styling, format dưới đây, không được tùy chỉnh bậy bạ:
```tsx
<div className="flex items-center gap-3 md:gap-4"> // className phải chuẩn 100% như này
    <h3 className="text-accent font-semibold whitespace-nowrap">Thông tin cơ bản</h3>  // className phải chuẩn 100% như này
    <div className="flex-1 border-b border-dashed border-accent mr-1" />  // className phải chuẩn 100% như này
</div>
```

## 3. Quy định về Trạng thái trống (Empty States)
```tsx
<div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2"> // className phải chuẩn 100% như này
    <Icon path={mdiPlaylistRemove} size={1} className="flex-shrink-0" /> {/* Thay thế icon MDI phù hợp với ngữ cảnh */}
    Không tìm thấy công ty. {/* Thay thế nội dung thông báo phù hợp */}
</div>
```

*Lưu ý: Nếu nằm trong Table, hãy đặt `div` này bên trong `TableCell`.*

## 4. Quy định về Tiêu đề Bảng (Table Headers)
Tiêu đề bảng cần gọn gàng, không sử dụng className cho TableRow (của Header) và TableHead, không lạm dụng định nghĩa chiều rộng (width) trừ khi thực sự cần thiết, cứ clean như mẫu dưới đây là được vì trong components/ui/table.tsx đã có định nghĩa sẵn. Thường sẽ được căn lề trái, ngoại trừ các cột đặc trưng như "STT":
```tsx
<TableHeader> // Không được thêm className
    <TableRow>  // Không được thêm className
        <TableHead>STT</TableHead>  // Không được thêm className
        <TableHead>Mã nhân viên</TableHead>  // Không được thêm className
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

## 5. Quy định về Badges
Các component Badge không được sử dụng `className` để tùy chỉnh styling (màu sắc, kích thước, padding, v.v.). Chỉ sử dụng các `variant` đã được định nghĩa sẵn trong `components/ui/badge.tsx` để đảm bảo tính nhất quán:
```tsx
<Badge variant="green">Hoạt động</Badge>
<Badge variant="orange">Chờ xử lý</Badge>
<Badge variant="red">Quá hạn</Badge>
```

## 6. Quy định về Form (Label, Input, Textarea)
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

## 7. Quy định về Button
```tsx
// Nút bình thường (Bắt buộc có icon size 0.8)
<Button variant="accent" onClick={handleSave}> // chỉ sử dụng variant, không sử dụng className
    <Icon path={mdiContentSave} size={0.8} /> // phải đúng size là 0.8
    Lưu dữ liệu
</Button>

// Nút có trạng thái loading
<Button type="submit" disabled={isPending}> // chỉ sử dụng variant, không sử dụng className
    {isPending ? (
        <Icon path={mdiLoading} size={0.8} /> // phải đúng size là 0.8
    ) : (
        <Icon path={mdiPlus} size={0.8} /> // phải đúng size là 0.8
    )}
    Lưu thay đổi
</Button>
```

## 8. Quy định về Kích thước chữ (Font Size)
Cấm tuyệt đối việc sử dụng `text-[10px]`, `text-[11px]`, tức là dạng [?px], nhỏ nhất phải là `text-xs`.

## 9. Quy định về Kích thước Icon (Icon Size)
Tuyệt đối **CHỈ SỬ DỤNG** 2 kích thước icon sau cho toàn bộ dự án:
- `size={0.8}`: Kích thước tiêu chuẩn cho các nút bấm, tiêu đề, và thông tin chính.
- `size={0.6}`: Kích thước nhỏ khi cần hiển thị icon trong không gian hẹp (phụ đề, danh sách con).
- **Cấm tuyệt đối** việc sử dụng các size khác (0.7, 0.75, 0.9, v.v.).

## 10. Quy định về Ô nhập mật khẩu (Password Input with Toggle)
Các ô nhập mật khẩu phải có chức năng ẩn/hiện mật khẩu sử dụng icon `mdiEye` và `mdiEyeOff`. Luôn sử dụng cấu trúc `relative` để đặt nút bấm icon vào bên phải của ô nhập:

```tsx
<div className="relative">
    <Input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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

## 11. Quy định về Màu sắc Text (Text Colors)
Màu sắc của text **BẮT BUỘC** chỉ được sử dụng các class sau để duy trì tính đồng nhất. Cấm tuyệt đối việc sử dụng các mã màu HEX tự phát hoặc các class màu khác không có trong danh sách:
- **`text-accent`**: Dùng cho các tiêu đề quan trọng, các phần cần nhấn mạnh hoặc các trạng thái chủ đạo.
- **`text-neutral-300`**: Dùng cho nội dung văn bản chính, thông tin chi tiết.
- **`text-neutral-400`**: Dùng cho các đoạn văn bản phụ, ghi chú, placeholder hoặc thông tin ít quan trọng hơn.
- **`text-white`**: Chỉ dùng khi thực sự cần độ tương phản cao nhất trên nền tối.

## 12. Quy định về sử dụng màu sắc
Hiện tại giao diện đang sử dụng Dark Mode (không sử dụng light mode), nên các màu sắc chỉ sử dụng các màu đã config sau: text-neutral-400, text-neutral-300 và các màu đã được config như accent, darkBorderV1, darkBackgroundV1, darkCardV1

## 13. Quy định về Đơn vị Spacing (Gap, Padding, Margin, Space)
Để đảm bảo nhịp điệu thị giác (visual rhythm) đồng nhất, dự án chỉ sử dụng các đơn vị chia hết cho 4 cho các thuộc tính spacing. Cụ thể:
- **ĐƠN VỊ DUY NHẤT**: Chỉ sử dụng `gap-4`, `p-4`, `m-4`, `space-x-4`, `space-y-4` , `px-4 `, `py-4`,....
- **CẤM TUYỆT ĐỐI**: Không sử dụng các đơn vị như `gap-4`, `p-6`, `space-y-4`, `m-10`, v.v... Nếu cần không gian lớn hơn, hãy sử dụng `gap-8` hoặc `gap-12`. Ưu tiên hàng đầu luôn là **4**.

## 14. Quy định về Ô tìm kiếm (Search Input with Icon)
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

## 15. Quy định về Kích thước chữ tối thiểu (Minimum Font Size)
Để đảm bảo khả năng đọc (readability) và tính chuyên nghiệp trên mọi thiết bị:
- **KÍCH THƯỚC TỐI THIỂU**: Tuyệt đối không sử dụng các kích thước chữ tùy chỉnh như `text-sm`, `text-[11px]`, `text-[12px]`, v.v...
- **CHUẨN**: Kích thước chữ nhỏ nhất được phép sử dụng trong dự án là **`text-sm`**.
- **NGOẠI LỆ**: Chỉ sử dụng `text-xs` trong những trường hợp cực kỳ đặc thù (labels phụ trong không gian quá hẹp), nhưng ưu tiên hàng đầu vẫn là **`text-sm`**.

## 16. Quy định về Breadcrumbs
Phải sử dụng component Breadcrumbs  
 <Breadcrumb className="mb-4">
          <BreadcrumbList> // Không được thêm className
            <BreadcrumbItem> // Không được thêm className
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink> // Không được thêm className
            </BreadcrumbItem> // Không được thêm className
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/shop">{productDetail.categoryId.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{productDetail.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

## 17. Quy định các section styling như sau
```tsx
 <section className="bg-[#0a0a0a] border-2 border-neutral-900 rounded-lg p-4"> // chuẩn 100% như này
    <h3 className="text-lg font-semibold text-accent mb-4 flex items-center gap-2 border-b border-b-neutral-800 pb-4">  // chuẩn 100% như này
        <Icon path={mdiPackageVariant} size={0.8}/>  // chuẩn 100% styling như này, đổi icon cho phù hợp với text
        Thông tin sản phẩm
    </h3>
    // content cho ở đây 
</section>
``