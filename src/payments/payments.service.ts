import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus, PaymentMethod } from './schemas/payment.schema';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { CreatePaymentUrlDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) { }

  async createPaymentUrl(dto: CreatePaymentUrlDto): Promise<ApiResponseType> {
    const { bookingId, method } = dto;

    if (!Types.ObjectId.isValid(bookingId)) {
      throw new HttpException('ID đơn đặt sân không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new HttpException('Không tìm thấy đơn đặt sân', HttpStatus.NOT_FOUND);
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new HttpException('Đơn đặt sân đã bị hủy', HttpStatus.BAD_REQUEST);
    }

    // Check if payment already exists
    let payment = await this.paymentModel.findOne({ bookingId: booking._id, status: PaymentStatus.PENDING }).exec();
    if (!payment) {
      payment = await this.paymentModel.create({
        bookingId: booking._id,
        amount: booking.finalPrice,
        method: method,
        status: PaymentStatus.PENDING,
      });
    }

    // URL generation based on method
    let paymentUrl = '';
    if (method === PaymentMethod.VNPAY) {
      const crypto = require('crypto');
      
      const tmnCode = process.env.VNP_TMN_CODE;
      const secretKey = process.env.VNP_HASH_SECRET;
      let vnpUrl = process.env.VNP_URL;
      const returnUrl = process.env.VNP_RETURN_URL;

      const date = new Date();
      const createDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
      const ipAddr = '127.0.0.1'; // in real scenario, get from request
      
      const vnp_Params: any = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = tmnCode;
      vnp_Params['vnp_Locale'] = 'vn';
      vnp_Params['vnp_CurrCode'] = 'VND';
      vnp_Params['vnp_TxnRef'] = booking._id.toString();
      vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + booking._id.toString();
      vnp_Params['vnp_OrderType'] = 'other';
      vnp_Params['vnp_Amount'] = booking.finalPrice * 100;
      vnp_Params['vnp_ReturnUrl'] = returnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_CreateDate'] = createDate;

      const sortedParams = Object.keys(vnp_Params).sort().reduce((result: any, key) => {
          result[key] = vnp_Params[key];
          return result;
      }, {});

      const signData = Object.keys(sortedParams)
          .map(key => `${key}=${encodeURIComponent(sortedParams[key].toString()).replace(/%20/g, '+')}`)
          .join('&');
          
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
      sortedParams['vnp_SecureHash'] = signed;
      
      const finalQueryStr = Object.keys(sortedParams)
          .map(key => `${key}=${encodeURIComponent(sortedParams[key].toString()).replace(/%20/g, '+')}`)
          .join('&');
      vnpUrl += '?' + finalQueryStr;

      paymentUrl = vnpUrl;
    } else if (method === PaymentMethod.MOMO) {
      paymentUrl = `https://test-payment.momo.vn/pay/orderId=${booking._id}`;
    } else {
      paymentUrl = `https://badmintonhub.com/payments/cash?orderId=${booking._id}`;
    }

    return createApiResponse({ paymentUrl, paymentId: payment._id }, 'Tạo link thanh toán thành công', HttpStatus.OK);
  }

  async handleCallback(query: any): Promise<any> {
    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionStatus, orderId, errorCode, status } = query;

    const bookingId = vnp_TxnRef || orderId;
    if (!bookingId || !Types.ObjectId.isValid(bookingId)) {
      return { RspCode: '99', Message: 'Invalid Order' };
    }

    const payment = await this.paymentModel.findOne({ 
      bookingId: new Types.ObjectId(bookingId) 
    }).sort({ createdAt: -1 }).exec();

    if (!payment) return { RspCode: '01', Message: 'Order not found' };

    if (payment.status === PaymentStatus.SUCCESS) return { RspCode: '02', Message: 'Order already confirmed' };

    // Simulating success logic for VNPAY/MOMO
    const isSuccess = vnp_ResponseCode === '00' || vnp_TransactionStatus === '00' || errorCode === '0' || status === 'success';

    if (isSuccess) {
      payment.status = PaymentStatus.SUCCESS;
      await payment.save();

      // Update booking status
      await this.bookingModel.findByIdAndUpdate(bookingId, { status: BookingStatus.CONFIRMED });

      return { RspCode: '00', Message: 'Confirm Success' };
    } else {
      payment.status = PaymentStatus.FAILED;
      await payment.save();
      return { RspCode: '00', Message: 'Payment Failed' };
    }
  }

  async getPaymentStatus(bookingId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new HttpException('ID đơn đặt sân không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const payment = await this.paymentModel.findOne({ bookingId: bookingId }).sort({ createdAt: -1 }).exec();
    if (!payment) {
      throw new HttpException('Không tìm thấy thông tin thanh toán cho đơn này', HttpStatus.NOT_FOUND);
    }

    return createApiResponse(payment, 'Lấy trạng thái thanh toán thành công', HttpStatus.OK);
  }
}
