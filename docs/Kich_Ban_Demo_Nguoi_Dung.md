# 🏸 BadmintonHub — Kịch Bản Demo Trực Quan Dưới Góc Nhìn Người Dùng (Không Dùng Từ Chuyên Ngành)

Tài liệu này là **Kịch bản demo và thuyết trình chạy thử ứng dụng** được viết hoàn toàn dưới góc độ của người trải nghiệm dịch vụ (Khách hàng, Chủ sân và Người quản trị). Kịch bản này loại bỏ toàn bộ các thuật ngữ kỹ thuật phức tạp (như API, DB, JWT, Backend, Socket, Overlap...), thay thế bằng ngôn ngữ đời thường, trực quan và dễ hiểu nhất để bạn dễ dàng trình bày trước Hội đồng.

---

## 👥 PHẦN I: GIỚI THIỆU CÁC VAI TRÒ TRONG HỆ THỐNG
*   **Người chơi / Khách vãng lai:** Những người có nhu cầu tìm sân chơi cầu lông, đặt giờ chơi và thanh toán nhanh chóng.
*   **Chủ sân:** Người sở hữu và vận hành các cơ sở sân cầu lông, cần quản lý lịch đặt, theo dõi doanh thu và tương tác với khách hàng.
*   **Người quản trị (Admin):** Người điều hành toàn bộ trang web, kiểm duyệt hồ sơ đăng ký của các chủ sân và theo dõi doanh thu toàn hệ thống.

---

## 🎬 PHẦN II: KỊCH BẢN DEMO CHI TIẾT TỪNG BƯỚC

### 1. KỊCH BẢN 1: TRẢI NGHIỆM ĐẶT SÂN ONLINE & THANH TOÁN NHANH CHÓNG
*(Góc nhìn của Khách hàng hoặc Người chơi đặt sân trực tuyến)*

*   **Bước 1 (Tìm kiếm và chọn sân):** 
    - Khách hàng mở trang web, xem danh sách các sân cầu lông hoặc sử dụng bản đồ tương tác để tìm sân gần mình nhất. Click vào sân **"XYZ"** để xem thông tin.
    - **Lời thuyết minh:** *"Tại đây, hệ thống tích hợp Trí tuệ nhân tạo (AI) thông minh tự động gợi ý cho khách hàng khung giờ chơi lý tưởng nhất cho ngày mai (Ví dụ: đề xuất 19:00 - 21:00 vì thời tiết tối mát mẻ, ánh sáng sân bật tối đa và không khí chơi vô cùng đông vui nhộn nhịp)."*
*   **Bước 2 (Chọn ngày chơi):** Khách hàng click chọn ngày muốn đặt trên thanh lịch trượt hiển thị 14 ngày kế tiếp.
*   **Bước 3 (Chọn sân con & Giờ chơi):** Trên lưới ô hiển thị các giờ còn trống của từng sân con, khách hàng nhấp chọn sân (ví dụ: Sân số 1) và click chọn khung giờ mong muốn (ví dụ: từ 18:00 đến 20:00).
*   **Bước 4 (Tùy chọn thêm & Khuyến mãi):** 
    - Khách hàng tích chọn ô **"Đặt lịch cố định hàng tuần"** nếu muốn giữ sân chơi đều đặn mỗi tuần.
    - Nhập mã giảm giá vào ô Khuyến mãi để được tự động trừ tiền.
    - Chọn hình thức thanh toán: **Thanh toán chuyển khoản VNPay** hoặc **Trả tiền mặt tại quầy**.
*   **Bước 5 (Nhập thông tin người đặt - Hệ thống tự nhận diện thông minh):** Hệ thống mở bảng điền thông tin:
    - *Trường hợp khách vãng lai (chưa đăng ký tài khoản):* Ô trống hoàn toàn, khách tự điền tay **Họ tên, Số điện thoại và Email**.
    - *Trường hợp khách đã đăng nhập tài khoản:* Xuất hiện nút **"Tự động điền"**. Khách hàng chỉ cần bấm nút, hệ thống sẽ tự khớp toàn bộ Họ tên, Email vào mẫu. Nếu tài khoản chưa cập nhật số điện thoại, khách hàng có thể gõ thêm trực tiếp vào ô SĐT.
*   **Bước 6 (Bấm đặt sân & Hệ thống tự động kiểm tra):** Khách hàng nhấn nút **"Đặt sân"**. 
    - **Lời thuyết minh:** *"Ngay lập tức, hệ thống sẽ tự động rà soát lịch biểu để đảm bảo khung giờ này chưa có ai đặt trước và sân không trong thời gian sửa chữa bảo trì. Nếu lịch trống, khách hàng sẽ được đưa tới màn hình thanh toán."*
*   **Bước 7 (Thanh toán & Nhận hóa đơn thành công):** 
    - Trình duyệt chuyển sang cổng thanh toán ngân hàng VNPay. Khách hàng thực hiện quét mã QR ngân hàng hoặc nhập thẻ thanh toán thành công.
    - Hệ thống chuyển về màn hình **"Đặt sân thành công"** hiển thị đầy đủ thông tin hóa đơn cùng một **Mã QR Check-in** sắc nét.
*   **Bước 8 (Nhận thư xác nhận tự động):** Hệ thống tự động gửi một **Email hóa đơn đẹp mắt** về hòm thư điện tử cá nhân của khách hàng để lưu giữ thông tin đối chiếu.
*   **Bước 9 (Chuyển hướng trang tiện lợi):** 
    - Nếu là khách vãng lai: Hệ thống đưa khách trở lại **Trang chủ**.
    - Nếu là người chơi đã đăng nhập: Hệ thống đưa khách thẳng tới trang **Lịch sử đặt sân** để tiện quản lý và theo dõi.

---

### 2. KỊCH BẢN 2: CHECK-IN NHẬN SÂN CỰC NHANH & ĐỒNG BỘ THỜI GIAN THỰC
*(Góc nhìn tương tác giữa Khách hàng và Chủ sân tại sân đấu)*

*   **Bước 1 (Đến sân và xuất trình thông tin):** Khách hàng di chuyển đến sân cầu lông XYZ để chơi. Khách hàng xuất trình thông tin nhận sân cho nhân viên trực sân bằng 2 cách tiện lợi:
    - *Cách 1:* Đọc mã đơn hàng in trên hóa đơn/email (Ví dụ: đơn hàng số `#BHXXXX`).
    - *Cách 2:* Mở ứng dụng điện thoại và đưa **Mã QR Check-in** hiển thị trong lịch sử đặt sân.
*   **Bước 2 (Chủ sân quét mã xác nhận):** Nhân viên trực sân mở camera điện thoại cá nhân và quét mã QR của khách hàng.
*   **Bước 3 (Hoàn tất nhận sân - Tránh bùng lịch):** Hệ thống lập tức nhận diện đơn hàng hợp lệ, tự động cập nhật trạng thái đơn hàng thành **"Đã hoàn thành check-in"**.
    - **Lời thuyết minh:** *"Quy trình quét mã cực nhanh này giúp chủ sân xác nhận khách đã có mặt thực tế tại sân chơi, ngăn chặn triệt để tình trạng khách đặt lịch ảo giữ chỗ giờ vàng rồi bùng sân trống gây tổn thất doanh thu."*
*   **Bước 4 (Minh chứng đồng bộ tức thì):** 
    - **Lời thuyết minh:** *"Đồng thời, trong suốt quá trình khách đặt sân thành công trực tuyến hoặc được nhân viên quét mã check-in tại quầy, trên màn hình máy tính quản lý của Chủ sân, các thông tin đơn hàng mới và trạng thái đơn hàng sẽ **tự động hiện lên và cập nhật tức thì mà chủ sân không cần bấm nút F5 tải lại trang web**."*

---

### 3. KỊCH BẢN 3: ĐĂNG KÝ KINH DOANH & XÉT DUYỆT TRỞ THÀNH CHỦ SÂN
*(Góc nhìn tương tác giữa Người đăng ký kinh doanh và Admin)*

*   **Bước 1 (Gửi hồ sơ đăng ký - Người chơi):**
    - Người chơi muốn đưa sân cầu lông của mình lên trang web kinh doanh sẽ bấm nút **"Trở thành chủ sân"** trên thanh công cụ.
    - Hệ thống chuyển tới trang Đăng ký. Người dùng điền tên cơ sở sân, số CCCD, số điện thoại, địa chỉ và tải lên ảnh **Mặt trước CCCD, Mặt sau CCCD và ảnh Giấy phép kinh doanh**. Nhấn "Gửi hồ sơ".
    - Trang cá nhân của người dùng hiển thị trạng thái **"Hồ sơ đang chờ phê duyệt"** từ ban quản trị.
*   **Bước 2 (Xem xét hồ sơ - Người quản trị Admin):**
    - Admin đăng nhập tài khoản quản trị, truy cập trang danh sách yêu cầu làm chủ sân. Danh sách các hồ sơ đang chờ duyệt sẽ hiện lên rõ ràng.
    - Admin nhấn chọn **"Xem chi tiết"** tại hồ sơ của người gửi. Một cửa sổ mở ra hiển thị toàn bộ thông tin đăng ký, Admin có thể click phóng to xem rõ nét hình chụp ảnh CCCD 2 mặt và ảnh Giấy phép kinh doanh để thẩm định tính xác thực.
*   **Bước 3 (Quyết định xét duyệt):**
    - *Trường hợp hồ sơ bị lỗi/mờ:* Admin bấm **"Từ chối"** và gõ lý do cụ thể (Ví dụ: *"Ảnh chụp giấy phép kinh doanh bị mờ, vui lòng chụp lại rõ nét hơn"*). Người gửi sẽ nhận được thông báo từ chối này ngay trên trang cá nhân của mình để chỉnh sửa gửi lại.
    - *Trường hợp hồ sơ hợp lệ:* Admin bấm **"Phê duyệt"**. Hệ thống lập tức kích hoạt, nâng cấp quyền tài khoản của người gửi thành **Chủ sân**.
*   **Bước 4 (Trải nghiệm trang cá nhân mới của Chủ sân):**
    - Người dùng đăng nhập lại sẽ thấy tài khoản của mình đã có quyền truy cập vào giao diện quản lý của chủ sân.
    - Chủ sân vào trang cá nhân mới của mình để xem bảng thống kê kết quả hoạt động (tự động đếm tổng giờ chơi, tổng số đơn hàng đã đặt, tổng số tiền chi tiêu), tự do đổi ảnh đại diện trực tiếp hoặc đổi mật khẩu tài khoản cực kỳ bảo mật (có nút bấm ẩn/hiện mật khẩu trực quan).

---

### 4. KỊCH BẢN 4: ĐẶT SÂN HỘ TẠI QUẦY & KHÓA SÂN ĐỂ BẢO TRÌ SỬA CHỮA
*(Góc nhìn của Chủ sân vận hành tại quầy)*

*   **Bước 1 (Đặt sân hộ cho khách vãng lai):** Khi có khách hàng gọi điện đặt lịch trước hoặc đến trực tiếp quầy, chủ sân click nút **"Đặt sân thủ công"** trên trang quản lý.
*   **Bước 2 (Điền thông tin đặt hộ):** 
    - Chủ sân chọn sân con (ví dụ: Sân số 2), chọn ngày giờ chơi và nhập Họ tên, Số điện thoại của khách hàng.
    - Nhấn chọn Xác nhận. Sơ đồ sân lập tức được cập nhật lịch đặt mới của khách mà không cần phải thanh toán trực tuyến.
    - **Lời thuyết minh:** *"Hệ thống thông minh tự động kiểm tra số điện thoại khách hàng. Nếu đây là khách mới chưa từng có tài khoản trên trang web, hệ thống sẽ tự động lưu lại thông tin để làm hồ sơ tích lũy lịch sử chơi cho khách cho các lần đặt tiếp theo."*
*   **Bước 3 (Khóa sân sửa chữa bảo trì):** 
    - **Lời thuyết minh:** *"Nếu có sân con cần sửa chữa thảm đấu, thay bóng đèn hoặc tổ chức giải nội bộ, chủ sân chọn tính năng **'Khóa sân bảo trì'** cho khung giờ đó. Khung giờ bị khóa này sẽ lập tức biến mất trên lịch đặt sân của khách hàng trực tuyến, đảm bảo khách hàng online không thể đặt trùng vào giờ đang sửa sân."*

---

### 5. KỊCH BẢN 5: THEO DÕI & BÁO CÁO DOANH THU TRỰC QUAN
*(Góc nhìn của Người quản trị Admin theo dõi dòng tiền)*

*   **Bước 1 (Truy cập báo cáo):** Admin đăng nhập tài khoản quản trị và truy cập mục **"Báo cáo doanh thu"**.
*   **Bước 2 (Theo dõi qua 4 bảng thống kê trực quan):** Màn hình hiển thị 4 thẻ thống kê lớn vô cùng sinh động và dễ hiểu:
    1. **Tổng doanh thu toàn hệ thống:** Tổng số tiền giao dịch thành công.
    2. **Doanh thu Tiền mặt:** Thống kê các đơn đặt trả tiền trực tiếp tại quầy.
    3. **Doanh thu VNPay:** Thống kê tiền thanh toán qua thẻ ngân hàng/quét mã VNPay trực tuyến.
    4. **Doanh thu Ví MoMo:** Thống kê tiền thanh toán qua ví điện tử MoMo.
*   **Bước 3 (Lọc tìm kiếm nhanh chóng):** Admin có thể lọc nhanh danh sách các giao dịch theo: Phương thức thanh toán, Tên chủ sân, Tên cơ sở sân, hoặc chọn một khoảng thời gian (Từ ngày... Đến ngày...).
*   **Bước 4 (Xem chi tiết giao dịch thực tế):** Bảng dữ liệu phía dưới sẽ tự động thay đổi số liệu lập tức theo bộ lọc, hiển thị rõ ràng mã giao dịch, tên khách hàng (kèm SĐT), tên cơ sở sân, tên chủ sở hữu, số tiền thanh toán (nổi bật màu cam), hình thức thanh toán và mốc thời gian giao dịch chính xác đến từng phút.

---

### 6. KỊCH BẢN 6: ĐÁNH GIÁ DỊCH VỤ & VÒNG LẶP PHẢN HỒI THÂN THIỆN
*(Góc nhìn tương tác hai chiều tăng uy tín giữa Khách hàng và Chủ sân)*

*   **Bước 1 (Khách hàng gửi đánh giá):** Sau khi chơi xong, khách hàng mở trang lịch sử đơn đặt, click nút **"Đánh giá"**. Khách hàng chọn số sao đánh giá (chấm điểm từ 1 đến 5 sao) và viết cảm nhận thực tế của mình rồi nhấn gửi.
*   **Bước 2 (Hiển thị công khai tức thì):** Nhận xét của khách hàng lập tức xuất hiện đồng thời tại 2 khu vực:
    - *Khu vực 1 (Trang web công khai):* Hiện ngay tại trang thông tin chi tiết sân để tất cả các khách hàng khác truy cập sau này đều có thể đọc tham khảo.
    - *Khu vực 2 (Trang quản lý nội bộ của Chủ sân):* Hiện trong mục quản lý nhận xét của chủ sân để chủ cơ sở kịp thời nắm bắt ý kiến đóng góp.
*   **Bước 3 (Chủ sân viết phản hồi lịch sự):** Chủ sân vào trang quản trị xem nhận xét của khách, viết câu trả lời cảm ơn hoặc giải đáp thắc mắc và gửi đi. Câu phản hồi của chủ sân sẽ hiển thị trang trọng ngay dưới nhận xét gốc của khách trên trang web công khai, giúp tăng tính tương tác thân thiện và uy tín cho sân cầu lông.
