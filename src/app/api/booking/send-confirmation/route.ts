import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, booking, venue, details } = await req.json();

    if (!email || !booking || !venue || !details) {
      return NextResponse.json({ message: 'Missing required information' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const detailsHtml = details.map((d: any) => `
      <div style="margin-bottom: 10px; padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #22C55E;">
        <p style="margin: 0; font-weight: 700; color: #1a1a1a;">Sân: ${d.courtId?.name || d.courtId}</p>
        <p style="margin: 5px 0 0; font-size: 14px; color: #4a4a4a;">
          Ngày: ${new Date(d.bookingDate).toLocaleDateString('vi-VN')}
        </p>
        <p style="margin: 2px 0 0; font-size: 14px; color: #22C55E; font-weight: 600;">
          Thời gian: ${d.startTime} - ${d.endTime}
        </p>
      </div>
    `).join('');

    const mailOptions = {
      from: `"BadmintonHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `[BadmintonHub] Xác nhận đặt sân thành công - #${booking._id?.slice(-6).toUpperCase()}`,
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
                <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #1a1a1a; text-align: center;">Thông tin đặt sân thành công</h2>
                <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: #4a4a4a; text-align: center;">
                  Cảm ơn bạn đã tin dùng <strong>BadmintonHub</strong>! Đơn đặt sân của bạn tại <strong>${venue.name}</strong> đã được ghi nhận.
                </p>
                
                <div style="background-color: #f8fff9; border: 2px dashed #22C55E; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                  <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #22C55E; font-weight: 700; margin-bottom: 15px; text-align: center;">Chi tiết đơn hàng</div>
                  <div style="color: #1a1a1a; font-size: 15px; line-height: 1.6;">
                    <p style="margin: 5px 0;"><strong>Mã đơn:</strong> #BH${booking._id?.slice(-6).toUpperCase()}</p>
                    <p style="margin: 5px 0;"><strong>Cơ sở:</strong> ${venue.name}</p>
                    <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${venue.address}</p>
                    <p style="margin: 5px 0;"><strong>Tổng tiền:</strong> <span style="color: #22C55E; font-weight: 700;">${booking.finalPrice?.toLocaleString('vi-VN')} VNĐ</span></p>
                  </div>
                  <div style="margin-top: 25px;">
                    <p style="font-weight: 700; border-bottom: 1px solid #eee; padding-bottom: 8px; color: #1a1a1a;">Lịch đặt chi tiết:</p>
                    ${detailsHtml}
                  </div>
                </div>
                
                <div style="padding: 20px; background-color: #fff8f1; border-radius: 10px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">
                    <strong>Lưu ý:</strong> Vui lòng đến sân trước 5-10 phút để làm thủ tục nhận sân. Khi đến nơi, bạn chỉ cần đưa mã đơn hàng cho nhân viên trực sân.
                  </p>
                </div>

                <p style="margin: 0; font-size: 14px; color: #7a7a7a; text-align: center;">
                  Mọi thắc mắc vui lòng liên hệ hotline cơ sở hoặc phản hồi qua email này.
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

    return NextResponse.json({ message: 'Confirmation email sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json({ message: 'Failed to send confirmation email', error: error.message }, { status: 500 });
  }
}
