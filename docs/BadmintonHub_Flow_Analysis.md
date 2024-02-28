# 🏸 BadmintonHub — Kịch Bản Demo & Thuyết Trình Bảo Vệ Đồ Án Tốt Nghiệp (100% Khớp Mã Nguồn)

Tài liệu này được thiết kế như một **Kịch bản thuyết trình từng bước (Step-by-step Demo Script)** để bạn sử dụng trực tiếp khi trình bày trước Hội đồng chấm Đồ án tốt nghiệp. Kịch bản này phản ánh chính xác 100% cấu trúc giao diện Frontend (`BadmintonHub-FE2`) và logic nghiệp vụ Backend (`BadmintonHub-BE`) mới nhất (bao gồm Quét mã QR Check-in, Đồng bộ Real-time, Đặt lịch tuần, AI Đề xuất, Hóa đơn Email, Quản lý Doanh thu Đa phương thức của Admin, và trang cá nhân nâng cao của Chủ sân).

---

## 🛠️ PHẦN I: TỔNG QUAN HỆ THỐNG & PHÂN QUYỀN TRUY CẬP (RBAC)

*"Kính thưa Hội đồng, hệ thống BadmintonHub được xây dựng nhằm giải quyết bài toán chuyển đổi số trong lĩnh vực quản lý và đặt sân cầu lông. Ứng dụng tích hợp công nghệ AI, thanh toán điện tử quốc gia và đồng bộ thời gian thực để kết nối mượt mà 4 nhóm đối tượng chính (Actors):"*

1. **Khách vãng lai (Guest):** Trải nghiệm tìm kiếm, nhận đề xuất sân từ AI, xem vị trí trên bản đồ, đặt sân trực tiếp không cần tài khoản và thanh toán qua VNPay.
2. **Người chơi (Player):** Đăng nhập xác thực **JWT**, xem đề xuất AI cá nhân hóa, đặt sân trực tuyến áp dụng Voucher khuyến mãi, lưu lịch tuần, xem lịch sử đặt sân, theo dõi chỉ số gamification cá nhân và nộp đơn đăng ký làm Chủ sân.
3. **Chủ sân (Court Owner):** Sở hữu trang quản trị riêng, thiết lập cơ sở sân, cấu hình giá động theo ngày/giờ chơi, quản lý lịch đặt sân, thực hiện đặt sân thủ công cho khách vãng lai, Khóa sân bảo trì (LOCK), theo dõi doanh thu và tương tác phản hồi đánh giá của người chơi.
4. **Quản trị viên (Admin):** Quản lý toàn sàn, kiểm duyệt hồ sơ đăng ký Chủ sân (Approved/Rejected kèm lý do), quản lý người dùng và theo dõi báo cáo doanh thu đa phương thức toàn hệ thống.

---

## 🎬 PHẦN II: KỊCH BẢN DEMO 6 LUỒNG NGHIỆP VỤ CHÍNH

### LUỒNG 1: Trải Nghiệm Đặt Sân Online & Thanh Toán Đa Phương Thức (Player & Guest)
*(Mục tiêu demo: Thể hiện tính năng tìm kiếm, đề xuất AI, thuật toán tránh trùng lịch, xử lý form thông minh, thanh toán VNPay và tự động gửi Email hóa đơn HTML)*

*   **Bước 1 (Chọn cơ sở sân):** 
    - *Thao tác trên FE:* Tại trang chủ hoặc bản đồ tương tác (`/venues`), nhấp chọn cơ sở sân **"XYZ"**.
    - *Thuyết trình:* *"Hệ thống hỗ trợ bản đồ vị trí trực quan giúp người dùng dễ dàng định vị cơ sở sân gần nhất. Đồng thời, hệ thống tích hợp mô hình AI nâng cao **`llama-3.3-70b-versatile`** qua **Groq SDK** để phân tích vị trí địa lý, đánh giá trung bình và thời tiết nhằm đưa ra đề xuất khung giờ vàng đặt sân tốt nhất cho khách hàng."*
*   **Bước 2 (Chọn ngày):** 
    - *Thao tác trên FE:* Tại trang chi tiết sân, nhấp chọn ngày chơi trên thanh lịch trượt **`DateSwiper`** (hỗ trợ hiển thị 14 ngày kế tiếp).
*   **Bước 3 (Chọn sân con & khung giờ):** 
    - *Thao tác trên FE:* Trên lưới giờ trống (**`CourtTimeGrid`**), click chọn sân con (ví dụ: Sân số 1) và nhấp chọn khung giờ chơi trống (ví dụ: 18:00 - 20:00).
*   **Bước 4 (Tùy chọn nâng cao & PTTT):** 
    - *Thao tác trên FE:* 
        - Tích chọn ô checkbox **"Đặt lịch cố định hàng tuần"** (nếu muốn chơi định kỳ cố định).
        - Nhập mã giảm giá (Voucher) vào ô Khuyến mãi để hệ thống tự động giảm trừ tiền theo chính sách.
        - Chọn phương thức thanh toán: **VNPay (Trực tuyến)** hoặc **Tiền mặt (CASH)**.
*   **Bước 5 (Nhập thông tin cá nhân - Phân nhánh thông minh):** 
    - *Thao tác trên FE:* Hệ thống hiển thị Dialog thông tin liên hệ:
        - *Nếu là Khách vãng lai:* Form trống yêu cầu điền đầy đủ: **Họ tên, Số điện thoại, Email**.
        - *Nếu là Thành viên đã đăng nhập:* Màn hình hiển thị nút **"Tự động điền"** (Auto-fill). Khi nhấp chọn, hệ thống tự động lấy Email và Họ tên từ Profile. Nếu tài khoản chưa cập nhật số điện thoại, ô nhập SĐT sẽ trống để người dùng tự điền bổ sung trực tiếp.
*   **Bước 6 (Nhấn Đặt sân & Xử lý trùng lịch):** 
    - *Thao tác trên FE:* Nhấn nút **"Đặt sân"**.
    - *Thuyết trình:* *"Ngay khi người dùng nhấn nút, Backend NestJS sẽ lập tức chạy **Thuật toán kiểm tra trùng lịch (Interval Overlap Algorithm)** trong bảng `BookingDetail` và bảng khóa sân `UnavailableTime` bằng truy vấn toán học biểu diễn điều kiện giao nhau thời gian: $(T_{start1} < T_{end2}) \land (T_{end1} > T_{start2})$. Nếu phát hiện trùng lặp hoặc giờ bị khóa bảo trì, API lập tức phản hồi lỗi `409 Conflict` để ngăn chặn trùng lịch."*
*   **Bước 7 (Cổng thanh toán & Màn hình thành công):** 
    - *Thao tác trên FE:* Trình duyệt chuyển hướng sang **Cổng thanh toán quốc gia VNPay sandbox**. Thực hiện nhập thông tin thẻ test và nhấn xác nhận thanh toán thành công. VNPay tự động điều hướng trở lại màn hình Đặt sân thành công của hệ thống (`/booking/success`).
    - *Thuyết trình:* *"Giao dịch thanh toán được mã hóa chữ ký SHA512 đảm bảo bảo mật tuyệt đối. Khi VNPay gửi IPN Callback về Backend thành công, đơn hàng tự động chuyển sang trạng thái `CONFIRMED`."*
*   **Bước 8 (Nhận Hóa đơn & Email):** 
    - *Thao tác trên FE:* Màn hình `/booking/success` hiển thị hóa đơn chi tiết đơn đặt kèm một **Mã QR Code xác thực** đặc biệt (chứa liên kết nén mã hóa ID đơn hàng để phục vụ check-in).
    - *Backend:* Tự động kích hoạt luồng gửi **Email hóa đơn xác nhận đặt sân** (HTML được thiết kế sang trọng, hiển thị đầy đủ tên cơ sở, địa chỉ, tổng tiền, mã hóa đơn 6 ký tự cuối cùng và chi tiết giờ chơi) tới địa chỉ email của người đặt thông qua dịch vụ Nodemailer.
*   **Bước 9 (Điều hướng kết quả sau đặt):** 
    - *Thao tác trên FE:* 
        - Nếu là *Khách vãng lai*: Hệ thống hiển thị nút điều hướng đưa khách quay lại **Trang chủ**.
        - Nếu là *Thành viên*: Hệ thống tự động chuyển hướng người dùng thẳng về trang **Lịch sử đặt sân** (`/my-bookings`).

---

### LUỒNG 2: Quy Trình Check-in Bảo Mật & Tương Tác Đồng Bộ Thời Gian Thực (Owner)
*(Mục tiêu demo: Khắc phục triệt để vấn đề đặt sân ảo rồi bùng giờ vàng, minh chứng tính năng đồng bộ dữ liệu thời gian thực không cần tải lại trang)*

*   **Bước 1 (Di chuyển & Trình diện):** Người chơi di chuyển đến sân đấu và mở trang chi tiết hóa đơn trong Lịch sử đặt sân (`/my-bookings`).
*   **Bước 2 (Xác thực check-in đa phương án):** Người chơi trình diện thông tin cho nhân viên trực sân bằng 2 cách linh hoạt:
    - *Cách 1:* Đọc mã đơn hàng `#BHXXXX` hoặc mở email hóa đơn đối chiếu.
    - *Cách 2 (Hiện đại):* Xuất trình **Mã QR Code** trên màn hình điện thoại.
*   **Bước 3 (Chủ sân quét mã QR nhận diện):** Nhân viên trực sân dùng camera điện thoại quét mã QR của khách. Mã tự động phân giải đường link nén an toàn dẫn thẳng tới API check-in trên hệ thống Backend.
*   **Bước 4 (Cập nhật trạng thái check-in):** API được thực thi, hệ thống ghi nhận khách đã đến sân thành công, tự động chuyển đổi trạng thái của đơn hàng sang **`COMPLETED`**.
*   **Bước 5 (Minh chứng đồng bộ thời gian thực - Real-time Sync):** 
    - *Thao tác trên màn hình máy tính của Chủ sân:* Chủ sân mở trang Quản lý đơn hàng (`/owner/bookings`).
    - *Thuyết trình:* *"Kính thưa Hội đồng, ngay khi khách hàng thực hiện đặt sân thành công ở Giai đoạn 1 hoặc được quét mã QR xác nhận check-in ở Giai đoạn 2, thông tin đơn đặt sân mới lập tức **tự động tải lên và cập nhật trạng thái ngay tức thì trên Dashboard của Chủ sân** nhờ cơ chế đồng bộ tự động mà không cần chủ sân phải thực hiện tải lại trang (F5). Điều này đảm bảo tính tương tác thời gian thực tuyệt đối và mang lại trải nghiệm vô cùng mượt mà."*

---

### LUỒNG 3: Đăng Ký Trở Thành Chủ Sân & Admin Phê Duyệt Xét Duyệt (Become Owner & Admin Approval)
*(Mục tiêu demo: Mô tả quy trình xét duyệt hồ sơ doanh nghiệp nghiêm ngặt, tự động nâng cấp phân quyền tài khoản (RBAC) trong database)*

*   **Bước 1 (Gửi yêu cầu - Người chơi):**
    - *Thao tác trên FE:* Người chơi đăng nhập tài khoản có quyền `PLAYER`, nhấp chọn nút **"Trở thành chủ sân"** $\rightarrow$ Hệ thống điều hướng đến trang Đăng ký (`/register-owner`).
    - *Thao tác điền form:* Nhập Tên doanh nghiệp/sân, số CMND/CCCD, SĐT, Email và tải lên hình ảnh **Mặt trước CCCD**, **Mặt sau CCCD**, **Giấy phép hoạt động thể thao / Giấy ĐKKD**. Nhấn nút "Gửi hồ sơ".
    - *Backend:* Tiếp nhận dữ liệu, tự động đẩy tệp tin lên dịch vụ lưu trữ đám mây Cloudinary/Appwrite Storage để nhận về URL bảo mật, tạo bản ghi `OwnerRequest` mới với trạng thái `PENDING`. Trang cá nhân của người dùng hiển thị trạng thái hồ sơ đang chờ xét duyệt.
*   **Bước 2 (Kiểm duyệt hồ sơ - Admin):**
    - *Thao tác trên FE:* Admin đăng nhập, điều hướng đến trang quản lý yêu cầu làm chủ sân (`/admin/owner-requests`). Danh sách phân trang tất cả hồ sơ đang ở trạng thái `PENDING` sẽ hiển thị đầy đủ.
    - *Thao tác xem chi tiết:* Admin nhấn chọn nút **"Xem chi tiết"** tại hồ sơ của người dùng. Hệ thống mở hộp thoại Popup chi tiết, Admin sử dụng tính năng xem trước hình ảnh (Preview) để phóng to trực quan hình chụp CCCD mặt trước/sau và Giấy phép kinh doanh của người đăng ký để xác thực tính pháp lý.
*   **Bước 3 (Phân nhánh Quyết định của Admin):**
    - *Nhánh A - Từ chối (REJECTED):* Admin nhấn chọn nút **"Từ chối"** $\rightarrow$ Hệ thống hiển thị hộp thoại bắt buộc Admin nhập **Lý do từ chối** (`rejectReason`) $\rightarrow$ Xác nhận gửi $\rightarrow$ Trạng thái đơn chuyển sang `REJECTED`, người dùng nhận thông báo lý do từ chối trên trang cá nhân kèm nút chỉnh sửa gửi lại hồ sơ.
    - *Nhánh B - Phê duyệt (APPROVED):* Admin nhấn chọn nút **"Phê duyệt"** và xác nhận $\rightarrow$ Backend cập nhật trạng thái `OwnerRequest` thành `APPROVED` và **tự động kích hoạt trigger nâng cấp quyền của User (`role`) từ `PLAYER` chuyển thành `COURT_OWNER`** trực tiếp trong database.
*   **Bước 4 (Trang cá nhân của Chủ sân mới):**
    - *Thao tác trên FE:* Ở lần đăng nhập tiếp theo, tài khoản người dùng được mở quyền truy cập Dashboard của Chủ sân (`/owner/*`).
    - *Trải nghiệm trang cá nhân mới (`/owner/profile`):* Chủ sân mới có thể xem trang thông tin cá nhân được nâng cấp: Tự động thống kê số giờ chơi, số đơn hàng, tổng chi tiêu; cho phép đổi hình đại diện (Avatar) tải lên đám mây thời gian thực; hỗ trợ đổi mật khẩu an toàn với tính năng ẩn/hiện mật khẩu trực quan.

---

### LUỒNG 4: Đặt Sân Thủ Công & Khóa Sân Bảo Trì (Owner Manual Booking & LOCK)
*(Mục tiêu demo: Hỗ trợ đặt lịch tại quầy cho khách vãng lai gọi điện/đến trực tiếp và tính năng khóa sân con phục vụ giải đấu hoặc bảo trì đột xuất)*

*   **Bước 1 (Mở Form đặt sân thủ công):**
    - *Thao tác trên FE:* Tại trang quản lý lịch đặt của Chủ sân, nhấp chọn nút **"Đặt sân thủ công"** để mở hộp thoại **`ManualBookingDialog`**.
*   **Bước 2 (Chọn sân con & Thời gian):**
    - *Thao tác điền form:* 
        - Chọn cơ sở sân đang quản lý và chọn sân con cụ thể (ví dụ: Sân số 2).
        - Chọn ngày đặt thông qua lịch biểu **`DatePicker`** và chọn giờ bắt đầu/giờ kết thúc qua **`TimePicker`**.
*   **Bước 3 (Nhập thông tin khách hàng vãng lai):**
    - *Thao tác điền form:* Nhập Tên khách hàng và Số điện thoại liên hệ.
    - *Backend xử lý:* *"Khi nhấn Xác nhận, Backend sẽ tự động kiểm tra số điện thoại khách hàng trong DB. Nếu số điện thoại này chưa từng có tài khoản, hệ thống sẽ **tự động tạo một tài khoản ẩn (Guest Player)** với email dummy dạng `${phone}@guest.bmhub.vn` để đồng bộ và lưu giữ lịch sử chơi của khách hàng này."*
*   **Bước 4 (Xác nhận đặt thành công):** Nhấn chọn nút **"Xác nhận thực hiện"** $\rightarrow$ Hệ thống kiểm tra không trùng lịch, tạo đơn hàng và tự động cập nhật trạng thái đơn hàng sang **`CONFIRMED`** tức thì mà không cần qua cổng thanh toán trực tuyến.
*   **Bước 5 (Tùy chọn Khóa sân bảo trì - LOCK):** 
    - *Thuyết trình:* *"Trong trường hợp cần bảo trì sân hoặc tổ chức giải đấu, chủ sân chọn loại giao dịch là **`LOCK`**. Hệ thống sẽ không tạo đơn đặt sân thông thường mà tạo trực tiếp một bản ghi trong bảng `UnavailableTime`. Khung giờ bị khóa này sẽ lập tức biến mất khỏi lịch trống trực tuyến của người chơi, ngăn chặn triệt để tình trạng đặt nhầm sân đang bảo trì."*

---

### LUỒNG 5: Quản Lý & Báo Cáo Doanh Thu Đa Phương Thức Của Admin (Admin Revenue Dashboard)
*(Mục tiêu demo: Minh chứng khả năng tổng hợp tài chính nâng cao, cung cấp cái nhìn toàn cảnh về dòng tiền cho Ban quản trị)*

*   **Bước 1 (Truy cập báo cáo):**
    - *Thao tác trên FE:* Admin đăng nhập và truy cập trang **Báo cáo & Phân tích doanh thu** (`/admin/revenue`).
*   **Bước 2 (Tổng hợp qua các thẻ thống kê trực quan):**
    - *Thuyết trình:* *"Giao diện cung cấp cho Admin 4 thẻ thống kê tài chính lớn được cập nhật liên tục:
        1. **Tổng doanh thu toàn sàn:** Tổng hợp toàn bộ số tiền giao dịch thành công.
        2. **Doanh thu Tiền mặt:** Thống kê các đơn hàng thanh toán trực tiếp tại quầy của tất cả các cơ sở.
        3. **Doanh thu VNPay:** Thống kê doanh thu qua cổng thẻ ATM/QR Quốc gia.
        4. **Doanh thu Ví MoMo:** Thống kê doanh thu qua cổng thanh toán điện tử MoMo."*
*   **Bước 3 (Bộ lọc tìm kiếm nâng cao):**
    - *Thao tác trên FE:* Admin có thể lọc giao dịch theo:
        - Phương thức thanh toán (Tiền mặt / VNPay / Ví MoMo).
        - Chủ sân sở hữu.
        - Cơ sở sân cụ thể.
        - Khoảng thời gian cụ thể (Từ ngày - Đến ngày qua lịch biểu).
    - *Thao tác:* Chọn một bộ lọc cụ thể $\rightarrow$ Danh sách giao dịch phân trang phía dưới lập tức tự động load lại dữ liệu tương ứng cực kỳ nhanh chóng.
*   **Bước 4 (Chi tiết giao dịch thực tế):** Bảng dữ liệu hiển thị rõ ràng mã giao dịch định danh độc nhất, tên khách hàng (kèm SĐT), tên cơ sở sân, tên chủ sở hữu, số tiền thanh toán làm nổi bật màu cam đặc trưng, badge phương thức thanh toán và mốc thời gian giao dịch chính xác đến từng phút.

---

### LUỒNG 6: Đánh Giá Dịch Vụ & Vòng Lặp Phản Hồi Tương Tác (Reviews & Rating Loop)
*(Mục tiêu demo: Thể hiện tính năng tương tác hai chiều chặt chẽ giữa khách hàng và chủ cơ sở kinh doanh)*

*   **Bước 1 (Người chơi gửi đánh giá):** Sau khi kết thúc buổi chơi thành công (đơn hàng ở trạng thái `COMPLETED`), Người chơi mở lịch sử đơn hàng, chọn chức năng **Đánh giá**. Chấm số sao (Rating từ 1-5 sao), viết nội dung bình luận (Comment) đánh giá chất lượng thảm đấu, ánh sáng và phục vụ rồi nhấn gửi.
*   **Bước 2 (Đồng bộ hiển thị công khai ở 2 khu vực):**
    - *Khu vực 1 (Trang chi tiết sân Công khai - Public Page):* Đánh giá mới nhất của người chơi lập tức hiển thị công khai tại mục Đánh giá trên trang chi tiết sân bên phía trang khách hàng để cộng đồng người chơi khác cùng tham khảo.
    - *Khu vực 2 (Dashboard chi tiết sân của Chủ sân - Private Dashboard):* Chủ sân đăng nhập trang quản trị sẽ nhìn thấy nhận xét của khách hàng xuất hiện ngay trong tab quản lý đánh giá của cơ sở sân con tương ứng.
*   **Bước 3 (Chủ sân phản hồi - Reply):** Chủ sân click nút **"Phản hồi" (Reply)** dưới đánh giá của người chơi tại Dashboard, viết câu trả lời (ví dụ: *"Cảm ơn bạn đã phản hồi, chúng tôi sẽ sớm bảo dưỡng lại hệ thống điều hòa tại sân số 1!"*) và gửi đi. Nội dung phản hồi của chủ sân lập tức được đồng bộ và hiển thị trang trọng ngay dưới bình luận gốc trên trang chi tiết sân công khai của người chơi.

---

## 💡 PHẦN III: NHỮNG ĐIỂM SÁNG CÔNG NGHỆ ĐỂ TRÌNH BÀY TRƯỚC HỘI ĐỒNG

Khi trả lời câu hỏi phản biện của Hội đồng, hãy nhấn mạnh vào **3 điểm sáng kỹ thuật vượt trội** sau đây của BadmintonHub để nâng cao điểm số:

1.  **Thuật toán tối ưu hóa lịch đặt và giá động (Interval Overlap & Dynamic Pricing):** Hệ thống không dùng cơ chế chia block giờ cứng nhắc mà cho phép đặt thời gian linh hoạt (ví dụ: đặt lẻ 1 tiếng 15 phút, đặt nối giờ), giải quyết bài toán chồng chéo lịch bằng đại số khoảng và tự động tính toán biểu giá động tăng/giảm giữa ngày thường và cuối tuần hoặc khung giờ cao điểm.
2.  **Đồng bộ dữ liệu thời gian thực (Real-time Synchronization):** Đưa ra minh chứng về tương tác không độ trễ giữa Khách hàng (Đặt sân / Check-in QR) và Chủ sân (Màn hình quản trị tự động cập nhật danh sách và trạng thái hóa đơn tức thì mà không cần F5 reload trang web).
3.  **Tích hợp Trí tuệ nhân tạo (AI Integration):** Sử dụng mô hình Groq AI tiên tiến để đọc hiểu dữ liệu sân thực tế, vị trí địa lý của người chơi để gợi ý sân đấu tương thích theo sở thích cá nhân, đề xuất khung giờ đặt sân vàng dựa trên các yếu tố thời tiết/ánh sáng, và tích hợp biểu đồ AI dự báo hiệu suất lấp đầy sân (Predicted Occupancy) giúp chủ sân tối ưu hóa doanh thu.
