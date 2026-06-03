import { Injectable } from '@nestjs/common';
// @ts-ignore
import * as nodemailer from 'nodemailer';
import { Booking } from '../bookings/schemas/booking.schema';
import { BookingDetail } from '../bookings/schemas/booking-detail.schema';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.MAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.MAIL_PORT || '587');
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      console.log('[MailService] SMTP credentials not set in .env. Falling back to log mode.');
    }
  }

  async sendOwnerRequestStatusEmail(params: {
    email: string;
    fullName: string;
    status: 'APPROVED' | 'REJECTED';
    rejectReason?: string;
  }): Promise<boolean> {
    const { email, fullName, status, rejectReason } = params;
    const isApproved = status === 'APPROVED';

    const subject = isApproved
      ? '[BadmintonHub] Chúc mừng! Đơn đăng ký chủ sân đã được duyệt!'
      : '[BadmintonHub] Thông báo về đơn đăng ký chủ sân';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${isApproved ? 'Duyệt đơn đăng ký chủ sân' : 'Từ chối đơn đăng ký chủ sân'}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #B3B3C6;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #161624; margin: 40px auto; border-radius: 16px; border: 1px solid #242438; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1E1E2E 0%, #0F0F1A 100%); padding: 30px; text-align: center; border-bottom: 1px solid #242438;">
              <h1 style="color: #44D7B6; margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">BadmintonHub</h1>
              <p style="color: #B3B3C6; margin: 5px 0 0 0; font-size: 14px;">Thông báo đơn đăng ký chủ sân</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #E2E2F0; font-size: 16px; margin: 0 0 20px 0;">Xin chào <strong>${fullName}</strong>,</p>

              ${isApproved ? `
                <p style="color: #44D7B6; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; font-weight: bold;">
                  Chúc mừng bạn! Đơn đăng ký làm chủ sân của bạn đã được duyệt thành công!
                </p>
                <p style="color: #B3B3C6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  Tài khoản của bạn đã được nâng cấp lên vai trò <strong style="color: #44D7B6;">Chủ sân (Court Owner)</strong>. Từ nay bạn có thể:
                </p>
                <ul style="color: #B3B3C6; font-size: 14px; line-height: 2; margin: 0 0 20px 20px;">
                  <li>Quản lý cơ sở sân cầu lông của mình</li>
                  <li>Tạo và chỉnh sửa thông tin các sân đấu</li>
                  <li>Đặt giá thuê theo khung giờ linh hoạt</li>
                  <li>Xem báo cáo doanh thu và hiệu suất khai thác</li>
                  <li>Tạo mã khuyến mãi cho khách hàng</li>
                </ul>
                <p style="color: #B3B3C6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  Hãy đăng nhập vào tài khoản để bắt đầu quản lý cơ sở của bạn ngay hôm nay!
                </p>
              ` : `
                <p style="color: #E74C3C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; font-weight: bold;">
                  Rất tiếc, đơn đăng ký làm chủ sân của bạn đã bị từ chối.
                </p>
                <p style="color: #B3B3C6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  <strong>Lý do từ chối:</strong>
                </p>
                <div style="background-color: rgba(231, 76, 60, 0.1); border-left: 3px solid #E74C3C; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="color: #E74C3C; font-size: 14px; margin: 0; line-height: 1.6;">${rejectReason || 'Không có lý do được cung cấp.'}</p>
                </div>
                <p style="color: #B3B3C6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  Nếu bạn cho rằng đây là sự hiểu lầm, vui lòng liên hệ bộ phận hỗ trợ hoặc gửi lại đơn đăng ký với thông tin bổ sung.
                </p>
              `}

              <!-- Footer -->
              <tr>
                <td style="background-color: #0F0F1A; padding: 20px; text-align: center; font-size: 12px; color: #6C6C82; border-top: 1px solid #242438;">
                  <p style="margin: 0 0 5px 0;">Cảm ơn bạn đã tin tưởng và đồng hành cùng BadmintonHub!</p>
                  <p style="margin: 0;">Mọi thắc mắc vui lòng liên hệ qua email này.</p>
                </td>
              </tr>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"BadmintonHub Notification" <${process.env.MAIL_USER}>`,
          to: email,
          subject,
          html: htmlContent,
        });
        console.log(`[MailService] Successfully sent owner request status email to ${email} (${status})`);
        return true;
      } catch (err) {
        console.error(`[MailService] Error sending owner status email to ${email}:`, err);
        return false;
      }
    } else {
      console.log(`\n======================================================`);
      console.log(`[MailService Simulation] - Gửi email trạng thái owner request!`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Status: ${status}`);
      if (rejectReason) console.log(`Reject Reason: ${rejectReason}`);
      console.log(`======================================================\n`);
      return true;
    }
  }

  async sendBookingConfirmation(booking: any, details: any[]): Promise<boolean> {
    const toEmail = booking.customerEmail || booking.playerId?.email;
    if (!toEmail || toEmail.endsWith('@guest.bmhub.vn')) {
      console.log(`[MailService] Customer has no valid email (${toEmail}), skipping sending.`);
      return false;
    }

    const customerName = booking.customerName || booking.playerId?.fullName || 'Quý khách';
    const customerPhone = booking.customerPhone || booking.playerId?.phone || 'N/A';
    const venueName = booking.venueId?.name || 'Cơ sở BadmintonHub';
    const venueAddress = booking.venueId?.address || '';
    const bookingCode = `BH${booking._id.toString().slice(-6).toUpperCase()}`;
    const totalPriceFormatted = (booking.finalPrice || booking.totalPrice || 0).toLocaleString();

    // Build booking details rows
    const detailsRowsHtml = details.map((d, idx) => {
      const courtName = d.courtId?.name || `Sân đấu`;
      const priceFormatted = (d.price || 0).toLocaleString();
      return `
        <tr style="border-bottom: 1px solid #2A2A3C;">
          <td style="padding: 12px; color: #E2E2F0; text-align: center;">${idx + 1}</td>
          <td style="padding: 12px; color: #E2E2F0;"><strong>${courtName}</strong></td>
          <td style="padding: 12px; color: #E2E2F0; text-align: center;">${d.bookingDate}</td>
          <td style="padding: 12px; color: #E2E2F0; text-align: center;"><span style="background: rgba(68, 215, 182, 0.1); color: #44D7B6; padding: 4px 8px; rounded: 4px; font-weight: bold;">${d.startTime} - ${d.endTime}</span></td>
          <td style="padding: 12px; color: #44D7B6; text-align: right; font-weight: bold;">${priceFormatted} đ</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hóa Đơn Xác Nhận Đặt Sân</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #B3B3C6;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #161624; margin: 40px auto; border-radius: 16px; border: 1px solid #242438; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1E1E2E 0%, #0F0F1A 100%); padding: 30px; text-align: center; border-bottom: 1px solid #242438;">
              <h1 style="color: #44D7B6; margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">BadmintonHub</h1>
              <p style="color: #B3B3C6; margin: 5px 0 0 0; font-size: 14px;">Hóa Đơn Xác Nhận Đặt Sân Thành Công</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #E2E2F0; font-size: 16px; margin: 0 0 20px 0;">Xin chào <strong>${customerName}</strong>,</p>
              <p style="color: #B3B3C6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Yêu cầu đặt sân của quý khách tại hệ thống <strong>BadmintonHub</strong> đã được xử lý và xác nhận thành công. Dưới đây là thông tin chi tiết hóa đơn đặt sân của bạn:</p>
              
              <!-- Info Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(68, 215, 182, 0.05); border: 1px dashed rgba(68, 215, 182, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 10px; color: #B3B3C6; font-size: 13px;"><strong>Mã đơn hàng:</strong></td>
                  <td style="padding-bottom: 10px; color: #44D7B6; font-size: 15px; font-weight: bold;">${bookingCode}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px; color: #B3B3C6; font-size: 13px;"><strong>Khách hàng:</strong></td>
                  <td style="padding-bottom: 10px; color: #E2E2F0; font-size: 14px;">${customerName} - ${customerPhone}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px; color: #B3B3C6; font-size: 13px;"><strong>Cơ sở đặt sân:</strong></td>
                  <td style="padding-bottom: 10px; color: #E2E2F0; font-size: 14px; font-weight: bold;">${venueName}</td>
                </tr>
                <tr>
                  <td style="color: #B3B3C6; font-size: 13px;"><strong>Địa chỉ cơ sở:</strong></td>
                  <td style="color: #E2E2F0; font-size: 13px; font-style: italic;">${venueAddress}</td>
                </tr>
              </table>

              <!-- Details Table -->
              <h3 style="color: #44D7B6; font-size: 15px; text-transform: uppercase; margin: 0 0 12px 0; border-left: 3px solid #44D7B6; padding-left: 10px;">Chi tiết lịch chơi</h3>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="background-color: #1E1E2E; border-bottom: 2px solid #2A2A3C;">
                    <th style="padding: 12px; color: #B3B3C6; font-size: 12px; text-transform: uppercase; text-align: center; width: 40px;">STT</th>
                    <th style="padding: 12px; color: #B3B3C6; font-size: 12px; text-transform: uppercase; text-align: left;">Tên sân</th>
                    <th style="padding: 12px; color: #B3B3C6; font-size: 12px; text-transform: uppercase; text-align: center;">Ngày chơi</th>
                    <th style="padding: 12px; color: #B3B3C6; font-size: 12px; text-transform: uppercase; text-align: center;">Khung giờ</th>
                    <th style="padding: 12px; color: #B3B3C6; font-size: 12px; text-transform: uppercase; text-align: right; width: 100px;">Giá tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${detailsRowsHtml}
                </tbody>
              </table>

              <!-- Total Card -->
              <table align="right" border="0" cellpadding="0" cellspacing="0" style="min-width: 240px; background-color: #1E1E2E; border: 1px solid #242438; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <tr>
                  <td style="color: #B3B3C6; font-size: 13px;">Tạm tính:</td>
                  <td style="color: #E2E2F0; font-size: 13px; text-align: right; font-weight: 500;">${booking.totalPrice.toLocaleString()} đ</td>
                </tr>
                ${booking.finalPrice < booking.totalPrice ? `
                <tr>
                  <td style="color: #44D7B6; font-size: 13px; padding-top: 5px;">Giảm giá:</td>
                  <td style="color: #44D7B6; font-size: 13px; text-align: right; font-weight: 500; padding-top: 5px;">-${(booking.totalPrice - booking.finalPrice).toLocaleString()} đ</td>
                </tr>
                ` : ''}
                <tr style="border-top: 1px dashed #2A2A3C;">
                  <td style="color: #44D7B6; font-size: 14px; font-weight: bold; padding-top: 10px;">TỔNG CỘNG:</td>
                  <td style="color: #44D7B6; font-size: 16px; font-weight: bold; text-align: right; padding-top: 10px;">${totalPriceFormatted} đ</td>
                </tr>
              </table>

              <div style="clear: both;"></div>

              <p style="color: #B3B3C6; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0;">Quý khách vui lòng có mặt trước giờ đặt **10 - 15 phút** để làm thủ tục nhận sân và chuẩn bị thi đấu tốt nhất. Để nhận sân nhanh chóng, quý khách có thể xuất trình **mã QR check-in** có sẵn trong mục lịch sử đặt sân của ứng dụng.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0F0F1A; padding: 20px; text-align: center; font-size: 12px; color: #6C6C82; border-top: 1px solid #242438;">
              <p style="margin: 0 0 5px 0;">Cảm ơn quý khách đã tin tưởng và đồng hành cùng BadmintonHub!</p>
              <p style="margin: 0;">Mọi thắc mắc vui lòng liên hệ hotline cơ sở hoặc phản hồi qua email này.</p>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"BadmintonHub Notification" <${process.env.MAIL_USER}>`,
          to: toEmail,
          subject: `[BadmintonHub] Hóa đơn xác nhận đặt sân thành công #${bookingCode}`,
          html: htmlContent,
        });
        console.log(`[MailService] Successfully sent booking confirmation email to ${toEmail}`);
        return true;
      } catch (err) {
        console.error(`[MailService] Error sending email to ${toEmail}:`, err);
        return false;
      }
    } else {
      console.log(`\n======================================================`);
      console.log(`[MailService Simulation] - Gửi email xác nhận đặt sân thành công!`);
      console.log(`To: ${toEmail}`);
      console.log(`Subject: [BadmintonHub] Hóa đơn xác nhận đặt sân thành công #${bookingCode}`);
      console.log(`Content length: ${htmlContent.length} characters`);
      console.log(`======================================================\n`);
      return true;
    }
  }

  async sendVenueReviewEmail(params: {
    email: string;
    fullName: string;
    venueName: string;
    status: 'ACTIVE' | 'APPROVED' | 'REJECTED';
    rejectReason?: string;
  }): Promise<boolean> {
    const { email, fullName, venueName, status, rejectReason } = params;
    const isApproved = status === 'ACTIVE' || status === 'APPROVED';

    const subject = isApproved
      ? `[BadmintonHub] Cơ sở "${venueName}" đã được duyệt!`
      : `[BadmintonHub] Cơ sở "${venueName}" bị từ chối`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${isApproved ? 'Duyệt cơ sở sân' : 'Từ chối cơ sở sân'}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #B3B3C6;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #161624; margin: 40px auto; border-radius: 16px; border: 1px solid #242438; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td style="background: linear-gradient(135deg, #1E1E2E 0%, #0F0F1A 100%); padding: 30px; text-align: center; border-bottom: 1px solid #242438;">
              <h1 style="color: #44D7B6; margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">BadmintonHub</h1>
              <p style="color: #B3B3C6; margin: 5px 0 0 0; font-size: 14px;">Thông báo cơ sở sân cầu lông</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="color: #E2E2F0; font-size: 16px; margin: 0 0 20px 0;">Xin chào <strong>${fullName}</strong>,</p>
              ${isApproved ? `
                <p style="color: #44D7B6; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; font-weight: bold;">
                  Chúc mừng! Cơ sở "${venueName}" của bạn đã được duyệt và hiển thị công khai trên hệ thống!
                </p>
                <p style="color: #B3B3C6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  Khách hàng giờ đây có thể tìm kiếm và đặt sân tại cơ sở của bạn. Hãy tiếp tục quản lý cơ sở để mang lại trải nghiệm tốt nhất cho người chơi nhé!
                </p>
                <p style="color: #B3B3C6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  Bạn có thể cập nhật thêm thông tin, thêm sân, đặt giá và xem báo cáo doanh thu trong trang quản lý của mình.
                </p>
              ` : `
                <p style="color: #E74C3C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; font-weight: bold;">
                  Rất tiếc! Cơ sở "${venueName}" của bạn đã bị từ chối.
                </p>
                <p style="color: #B3B3C6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  <strong>Lý do từ chối:</strong>
                </p>
                <div style="background-color: rgba(231, 76, 60, 0.1); border-left: 3px solid #E74C3C; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="color: #E74C3C; font-size: 14px; margin: 0; line-height: 1.6;">${rejectReason || 'Không có lý do được cung cấp.'}</p>
                </div>
                <p style="color: #B3B3C6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  Vui lòng chỉnh sửa thông tin cơ sở và gửi lại để được xét duyệt.
                </p>
              `}
              <p style="color: #6C6C82; font-size: 12px; margin: 0; padding-top: 20px; border-top: 1px solid #242438;">
                Cảm ơn bạn đã đồng hành cùng BadmintonHub!
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"BadmintonHub Notification" <${process.env.MAIL_USER}>`,
          to: email,
          subject,
          html: htmlContent,
        });
        console.log(`[MailService] Venue review email sent to ${email} (${status})`);
        return true;
      } catch (err) {
        console.error(`[MailService] Error sending venue review email to ${email}:`, err);
        return false;
      }
    } else {
      console.log(`\n======================================================`);
      console.log(`[MailService Simulation] - Gửi email duyệt/từ chối cơ sở sân!`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Status: ${status}`);
      if (rejectReason) console.log(`Reject Reason: ${rejectReason}`);
      console.log(`======================================================\n`);
      return true;
    }
  }

  async sendBookingReminderEmail(booking: any, startTime: string, venueName: string, venueAddress: string): Promise<boolean> {
    const toEmail = booking.customerEmail || booking.playerId?.email;
    if (!toEmail || toEmail.endsWith('@guest.bmhub.vn')) {
      return false;
    }

    const customerName = booking.customerName || booking.playerId?.fullName || 'Quý khách';
    const bookingCode = `BH${booking._id.toString().slice(-6).toUpperCase()}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nhắc Nhở Lịch Đánh Cầu</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F0F1A; font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #B3B3C6;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #161624; margin: 40px auto; border-radius: 16px; border: 1px solid #242438; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td style="background: linear-gradient(135deg, #1E1E2E 0%, #0F0F1A 100%); padding: 30px; text-align: center; border-bottom: 1px solid #242438;">
              <h1 style="color: #44D7B6; margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">BadmintonHub</h1>
              <p style="color: #B3B3C6; margin: 5px 0 0 0; font-size: 14px;">Nhắc nhở lịch chơi sắp tới</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="color: #E2E2F0; font-size: 16px; margin: 0 0 20px 0;">Xin chào <strong>${customerName}</strong>,</p>
              
              <p style="color: #44D7B6; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; font-weight: bold;">
                ⏰ Sắp tới giờ chơi rồi! Trận đánh cầu của bạn sẽ bắt đầu trong ít phút nữa.
              </p>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(68, 215, 182, 0.05); border: 1px dashed rgba(68, 215, 182, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 10px; color: #B3B3C6; font-size: 13px;"><strong>Mã đơn hàng:</strong></td>
                  <td style="padding-bottom: 10px; color: #44D7B6; font-size: 15px; font-weight: bold;">${bookingCode}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px; color: #B3B3C6; font-size: 13px;"><strong>Giờ bắt đầu:</strong></td>
                  <td style="padding-bottom: 10px; color: #E2E2F0; font-size: 16px; font-weight: bold;">${startTime}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px; color: #B3B3C6; font-size: 13px;"><strong>Cơ sở:</strong></td>
                  <td style="padding-bottom: 10px; color: #E2E2F0; font-size: 14px; font-weight: bold;">${venueName}</td>
                </tr>
                <tr>
                  <td style="color: #B3B3C6; font-size: 13px;"><strong>Địa chỉ:</strong></td>
                  <td style="color: #E2E2F0; font-size: 13px; font-style: italic;">${venueAddress}</td>
                </tr>
              </table>

              <p style="color: #B3B3C6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Vui lòng chuẩn bị vợt, giày và khởi động kỹ trước khi ra sân để tránh chấn thương nhé. Chúc bạn có một buổi giao lưu vui vẻ!
              </p>
              
              <p style="color: #6C6C82; font-size: 12px; margin: 0; padding-top: 20px; border-top: 1px solid #242438;">
                Cảm ơn bạn đã sử dụng dịch vụ của BadmintonHub!
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"BadmintonHub Notification" <${process.env.MAIL_USER}>`,
          to: toEmail,
          subject: `[BadmintonHub] Nhắc nhở lịch đánh cầu sắp tới #${bookingCode}`,
          html: htmlContent,
        });
        return true;
      } catch (err) {
        console.error(`[MailService] Error sending reminder email to ${toEmail}:`, err);
        return false;
      }
    } else {
      console.log(`\n======================================================`);
      console.log(`[MailService Simulation] - Gửi email NHẮC NHỞ LỊCH CHƠI!`);
      console.log(`To: ${toEmail}`);
      console.log(`Subject: [BadmintonHub] Nhắc nhở lịch đánh cầu sắp tới #${bookingCode}`);
      console.log(`======================================================\n`);
      return true;
    }
  }
}
