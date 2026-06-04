import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, fullName, status, rejectReason } = await req.json();

    if (!email || !fullName || !status) {
      return NextResponse.json({ message: 'Missing required information' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const isApproved = status === 'APPROVED';

    const mailOptions = {
      from: `"BadmintonHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: isApproved 
        ? `[BadmintonHub] Chúc mừng! Đơn đăng ký chủ sân của bạn đã được duyệt`
        : `[BadmintonHub] Thông báo kết quả đơn đăng ký chủ sân`,
      html: `
        <div style="background-color: #f4f4f7; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #eaeaef;">
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; text-align: center; border-bottom: 1px solid #f0f0f5;">
                <img src="https://res.cloudinary.com/drqbhj6ft/image/upload/v1777187460/primary-logo_plzzub.svg" alt="BadmintonHub Logo" style="height: 48px; width: auto; display: block; margin: 0 auto;" />
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #1a1a1a; text-align: center;">
                  ${isApproved ? 'Chúc Mừng Đơn Đăng Ký Đã Được Duyệt!' : 'Kết Quả Đăng Ký Chủ Sân'}
                </h2>
                <p style="margin: 0 0 25px; font-size: 16px; line-height: 24px; color: #4a4a4a;">
                  Xin chào <strong>${fullName}</strong>,
                </p>
                <p style="margin: 0 0 25px; font-size: 16px; line-height: 24px; color: #4a4a4a;">
                  Chúng tôi xin phản hồi về hồ sơ đăng ký trở thành **Chủ sân** trên nền tảng **BadmintonHub** của bạn.
                </p>
                
                ${isApproved ? `
                  <div style="background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: center;">
                    <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #15803d; font-weight: 700; margin-bottom: 10px;">TRẠNG THÁI: ĐÃ DUYỆT</div>
                    <p style="margin: 0; font-size: 15px; color: #166534; line-height: 1.6;">
                      Tài khoản của bạn đã được nâng cấp lên quyền **Chủ sân (Court Owner)** thành công. Bây giờ bạn có thể đăng nhập vào hệ thống và bắt đầu tạo cơ sở sân, quản lý lịch biểu và nhận đơn đặt sân từ người chơi.
                    </p>
                  </div>
                ` : `
                  <div style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                    <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #991b1b; font-weight: 700; margin-bottom: 10px; text-align: center;">TRẠNG THÁI: TỪ CHỐI</div>
                    <p style="margin: 0 0 10px; font-size: 15px; color: #7f1d1d; line-height: 1.6; text-align: center;">
                      Rất tiếc, hồ sơ đăng ký của bạn chưa được duyệt vào lúc này.
                    </p>
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin-top: 15px;">
                      <p style="margin: 0 0 5px; font-size: 14px; font-weight: 700; color: #1a1a1a;">Lý do từ chối:</p>
                      <p style="margin: 0; font-size: 14px; color: #4a4a4a; font-style: italic;">
                        ${rejectReason || 'Thông tin cung cấp chưa đầy đủ hoặc hình ảnh chưa rõ ràng.'}
                      </p>
                    </div>
                  </div>
                `}
                
                <div style="padding: 20px; background-color: #f8fafc; border-radius: 10px; border-left: 4px solid #64748b; margin-bottom: 30px;">
                  <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">
                    ${isApproved 
                      ? '<strong>Bước tiếp theo:</strong> Hãy truy cập vào trang chủ BadmintonHub, đăng nhập lại tài khoản để cập nhật quyền hạn và bắt đầu trải nghiệm trang quản trị dành riêng cho chủ sân.' 
                      : 'Bạn có thể chỉnh sửa lại thông tin hồ sơ của mình và gửi lại đơn đăng ký mới bất cứ lúc nào. Nếu cần hỗ trợ thêm, hãy phản hồi lại email này.'}
                  </p>
                </div>
                
                <p style="margin: 0; font-size: 14px; color: #7a7a7a; text-align: center;">
                  Cảm ơn bạn đã đồng hành cùng BadmintonHub!
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; background-color: #fafafa; text-align: center; border-top: 1px solid #f0f0f5;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #4a4a4a; font-weight: 600;">Hệ thống quản lý sân cầu lông BadmintonHub</p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #9a9a9a; line-height: 18px;">
                  Kết nối đam mê - Nâng tầm sức khỏe
                </p>
                <div style="font-size: 12px; color: #9a9a9a;">
                  &copy; 2026 BadmintonHub. All rights reserved.
                </div>
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Status email sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending mail:', error);
    return NextResponse.json({ message: 'Error sending email', error: error.message }, { status: 500 });
  }
}
