import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"BadmintonHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mã xác thực OTP đăng ký tài khoản - BadmintonHub',
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
                <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #1a1a1a; text-align: center;">Xác thực tài khoản của bạn</h2>
                <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: #4a4a4a; text-align: center;">
                  Chào mừng bạn đến với <strong>BadmintonHub</strong>! Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác thực dưới đây:
                </p>
                
                <div style="background-color: #f8fff9; border: 2px dashed #22C55E; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                  <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #22C55E; font-weight: 700; margin-bottom: 10px;">Mã OTP của bạn</div>
                  <div style="font-size: 42px; font-weight: 800; color: #22C55E; letter-spacing: 12px; font-family: monospace;">${otp}</div>
                </div>
                
                <p style="margin: 0 0 10px; font-size: 14px; color: #7a7a7a; text-align: center;">
                  Mã này sẽ hết hạn sau <span style="color: #1a1a1a; font-weight: 600;">5 phút</span>.
                </p>
                <p style="margin: 0; font-size: 13px; color: #9a9a9a; font-style: italic; text-align: center;">
                  Vì lý do bảo mật, vui lòng không chia sẻ mã này với bất kỳ ai.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; background-color: #fafafa; text-align: center; border-top: 1px solid #f0f0f5;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #4a4a4a; font-weight: 600;">Hệ thống quản lý sân cầu lông BadmintonHub</p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #9a9a9a; line-height: 18px;">
                  Nếu bạn không yêu cầu đăng ký tài khoản này, bạn có thể an tâm bỏ qua email này.
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

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Failed to send OTP', error: error.message }, { status: 500 });
  }
}
