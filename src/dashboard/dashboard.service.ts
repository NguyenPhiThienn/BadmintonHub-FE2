import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema';
import { BookingDetail, BookingDetailDocument } from '../bookings/schemas/booking-detail.schema';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { Court, CourtDocument } from '../courts/schemas/court.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { RevenueSummary, RevenueSummaryDocument } from './schemas/revenue-summary.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(BookingDetail.name) private bookingDetailModel: Model<BookingDetailDocument>,
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
    @InjectModel(Court.name) private courtModel: Model<CourtDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(RevenueSummary.name) private revenueSummaryModel: Model<RevenueSummaryDocument>,
  ) { }

  async getRevenue(ownerId: string, venueId?: string, query?: any): Promise<ApiResponseType> {
    const ownerObjectId = new Types.ObjectId(ownerId);

    // Get venue IDs for this owner
    let venueFilter: any = { ownerId: ownerObjectId };
    if (venueId) {
      if (!Types.ObjectId.isValid(venueId)) {
        throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
      }
      const venue = await this.venueModel.findById(venueId).exec();
      if (!venue || venue.ownerId.toString() !== ownerId.toString()) {
        throw new HttpException('Bạn không có quyền xem cơ sở này', HttpStatus.FORBIDDEN);
      }
      venueFilter._id = new Types.ObjectId(venueId);
    }

    const venues = await this.venueModel.find(venueFilter).exec();
    const venueIds = venues.map(v => v._id);

    if (venueIds.length === 0) {
      return createApiResponse({ summary: { totalRevenue: 0, totalBookings: 0 }, details: [] }, 'Thống kê doanh thu thành công', HttpStatus.OK);
    }

    // Build match filter - lấy tất cả đơn CONFIRMED/COMPLETED
    const matchFilter: any = {
      venueId: { $in: venueIds },
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
    };

    // Chỉ lọc theo ngày nếu có truyền startDate và endDate
    if (query?.startDate && query?.endDate) {
      const startDateFilter = new Date(query.startDate);
      const endDateFilter = new Date(query.endDate);
      startDateFilter.setHours(0, 0, 0, 0);
      endDateFilter.setHours(23, 59, 59, 999);
      matchFilter.createdAt = { $gte: startDateFilter, $lte: endDateFilter };
    }

    // Lấy tổng doanh thu từ bookings CONFIRMED hoặc COMPLETED
    const revenueData = await this.bookingModel.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalPrice' },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      totalBookings: revenueData[0]?.totalBookings || 0
    };

    return createApiResponse({ summary, details: [] }, 'Thống kê doanh thu thành công', HttpStatus.OK);
  }

  async getBookingStats(ownerId: string, venueId?: string, query?: any): Promise<ApiResponseType> {
    const ownerObjectId = new Types.ObjectId(ownerId);
    const venueFilter: any = { ownerId: ownerObjectId };
    if (venueId) {
      if (!Types.ObjectId.isValid(venueId)) {
        throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
      }
      venueFilter._id = new Types.ObjectId(venueId);
    }

    const venues = await this.venueModel.find(venueFilter).exec();
    const venueIds = venues.map(v => v._id);

    let totalDailyCapacity = 0;
    for (const venue of venues) {
      if (!venue.openTime || !venue.closeTime) continue;
      const numCourts = await this.courtModel.countDocuments({ venueId: venue._id });
      const [openH, openM] = venue.openTime.split(':').map(Number);
      const [closeH, closeM] = venue.closeTime.split(':').map(Number);
      const hours = (closeH + closeM / 60) - (openH + openM / 60);
      totalDailyCapacity += numCourts * hours;
    }

    // Always calculate from 1st of current month to last day of current month
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    const dayCount = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const activeBookingIds = (await this.bookingModel.aggregate([
      { $match: { venueId: { $in: venueIds } } },
      ...this.getRevenueMatchStage(),
      { $project: { _id: 1 } }
    ])).map(b => b._id);

    const occupancyData = await this.bookingDetailModel.aggregate([
      {
        $match: {
          bookingDate: { $gte: startDate, $lte: endDate },
          bookingId: { $in: activeBookingIds }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
          bookedHours: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          bookedHours: 1,
          capacity: { $literal: totalDailyCapacity },
          occupancyRate: {
            $cond: [
              { $gt: [totalDailyCapacity, 0] },
              { $multiply: [{ $divide: ['$bookedHours', totalDailyCapacity] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const dataMap = new Map<string, { bookedHours: number; capacity: number; occupancyRate: number }>();
    for (const item of occupancyData) {
      dataMap.set(item.date, {
        bookedHours: item.bookedHours,
        capacity: item.capacity,
        occupancyRate: item.occupancyRate,
      });
    }

    const filledOccupancyData = [];
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(startDate);
      d.setUTCDate(d.getUTCDate() + i);
      const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      const existing = dataMap.get(dateStr);
      filledOccupancyData.push({
        date: dateStr,
        bookedHours: existing?.bookedHours ?? 0,
        capacity: existing?.capacity ?? totalDailyCapacity,
        occupancyRate: existing?.occupancyRate ?? 0,
      });
    }

    return createApiResponse({ occupancyData: filledOccupancyData }, 'Thống kê đơn đặt sân thành công', HttpStatus.OK);
  }

  async getAdminSummary(query?: any): Promise<ApiResponseType> {
    const now = new Date();
    const year = query?.year ? parseInt(query.year) : now.getFullYear();
    const month = query?.month !== undefined ? parseInt(query.month) : now.getMonth() + 1;

    // Tính ngày đầu/tháng cuối tháng
    const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    // Lấy tổng doanh thu - chỉ sum payments
    const totalRevenueAgg = await this.paymentModel.aggregate([
      { 
        $match: { 
          status: { $in: ['SUCCESS', 'PAID'] },
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }
      },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
    const bookingsCount = totalRevenueAgg[0]?.count || 0;

    // Calculate previous month for growth
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthStart = new Date(prevYear, prevMonth - 1, 1, 0, 0, 0, 0);
    const prevMonthEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

    // Top 5 venues với dữ liệu tháng hiện tại
    const topVenuesData = await this.bookingModel.aggregate([
      { 
        $match: { 
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $lookup: {
          from: 'venues',
          localField: 'venueId',
          foreignField: '_id',
          as: 'venue'
        }
      },
      { $unwind: '$venue' },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'bookingId',
          pipeline: [{ $match: { status: { $in: ['SUCCESS', 'PAID'] } } }, { $project: { amount: 1 } }],
          as: 'paymentInfo'
        }
      },
      {
        $match: { paymentInfo: { $ne: [] } }
      },
      {
        $group: {
          _id: '$venueId',
          venueName: { $first: '$venue.name' },
          bookingsCount: { $sum: 1 },
          totalRevenue: { $sum: { $arrayElemAt: ['$paymentInfo.amount', 0] } },
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Lấy revenue tháng trước
    const prevRevenueAgg = await this.bookingModel.aggregate([
      { 
        $match: { 
          createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd }
        }
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'bookingId',
          pipeline: [{ $match: { status: { $in: ['SUCCESS', 'PAID'] } } }, { $project: { amount: 1 } }],
          as: 'paymentInfo'
        }
      },
      { $match: { paymentInfo: { $ne: [] } } },
      {
        $group: {
          _id: '$venueId',
          prevRevenue: { $sum: { $arrayElemAt: ['$paymentInfo.amount', 0] } },
        }
      }
    ]);

    const prevRevenueMap = new Map<string, number>();
    for (const item of prevRevenueAgg) {
      prevRevenueMap.set(item._id.toString(), item.prevRevenue);
    }

    const topVenues = topVenuesData.map((item: any) => {
      const prevRevenue = prevRevenueMap.get(item._id.toString()) || 0;
      const growthPct = prevRevenue > 0
        ? Math.round(((item.totalRevenue - prevRevenue) / prevRevenue) * 100)
        : item.totalRevenue > 0 ? 100 : 0;
      const growthStr = growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`;
      return {
        name: item.venueName || 'Cơ sở không xác định',
        bookings: item.bookingsCount,
        revenue: (item.totalRevenue / 1000000).toFixed(1) + 'M',
        growth: growthStr
      };
    });

    // User stats (không cần theo tháng)
    const userAgg = await this.userModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const userStats: Record<string, number> = {};
    for (const u of userAgg) {
      userStats[u._id] = u.count;
    }

    const venues = await this.venueModel.countDocuments();

    // Online users (last 30 mins)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const onlineNow = await this.userModel.countDocuments({
      lastLogin: { $gte: thirtyMinutesAgo }
    });

    // Tính occupancy rate
    const allVenues = await this.venueModel.find().exec();
    let totalCapacity = 0;
    let totalBookedHours = 0;

    for (const venue of allVenues) {
      if (!venue.openTime || !venue.closeTime) continue;
      const numCourts = await this.courtModel.countDocuments({ venueId: venue._id });
      const [openH, openM] = venue.openTime.split(':').map(Number);
      const [closeH, closeM] = venue.closeTime.split(':').map(Number);
      const hoursPerDay = (closeH + closeM / 60) - (openH + openM / 60);
      const daysInMonth = new Date(year, month, 0).getDate();
      totalCapacity += numCourts * hoursPerDay * daysInMonth;
    }

    // Đếm booked hours từ booking details trong tháng
    const occMonthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const occMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    
    const bookedAgg = await this.bookingDetailModel.aggregate([
      {
        $match: {
          bookingDate: { $gte: occMonthStart, $lte: occMonthEnd }
        }
      },
      { $count: 'totalBookedHours' }
    ]);
    totalBookedHours = bookedAgg[0]?.totalBookedHours || 0;

    const occupancyRate = totalCapacity > 0 
      ? Math.min(100, Math.round((totalBookedHours / totalCapacity) * 100)) 
      : 0;

    // Location distribution
    const locationStats: Record<string, number> = {};
    allVenues.forEach((v: any) => {
      let city = 'Khác';
      const addr = (v.address || '').toLowerCase();
      if (addr.includes('hồ chí minh') || addr.includes('hcm') || addr.includes('sài gòn') || addr.includes('q.') || addr.includes('quận')) {
        city = 'TP.HCM';
      } else if (addr.includes('hà nội') || addr.includes('hn')) {
        city = 'Hà Nội';
      } else if (addr.includes('đà nẵng') || addr.includes('dn')) {
        city = 'Đà Nẵng';
      } else if (addr.includes('cần thơ') || addr.includes('ct')) {
        city = 'Cần Thơ';
      }
      locationStats[city] = (locationStats[city] || 0) + 1;
    });

    const totalLocationVenues = allVenues.length;
    const locationDistribution = Object.keys(locationStats).map(city => ({
      city,
      percentage: totalLocationVenues > 0 ? Math.round((locationStats[city] / totalLocationVenues) * 100) : 0
    })).sort((a, b) => b.percentage - a.percentage);

    return createApiResponse({
      revenue: totalRevenue,
      bookings: bookingsCount,
      users: {
        total: Object.values(userStats).reduce((a: number, b: number) => a + b, 0),
        players: userStats[UserRole.PLAYER] || 0,
        owners: userStats[UserRole.COURT_OWNER] || 0
      },
      venues: venues,
      occupancyRate: occupancyRate,
      topVenues: topVenues,
      onlineNow: onlineNow,
      locationDistribution: locationDistribution,
      selectedMonth: { year, month },
    }, 'Lấy dữ liệu tổng quan thành công', HttpStatus.OK);
  }

  async getAdminCharts(type: string, period: string): Promise<ApiResponseType> {
    if (type === 'revenue') {
      // Lấy 30 ngày gần nhất từ payments trực tiếp
      const chartData = await this.paymentModel.aggregate([
        { $match: { status: { $in: ['SUCCESS', 'PAID'] } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+07:00' } },
            value: { $sum: '$amount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Lọc chỉ 30 ngày gần nhất
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      const filtered = chartData.filter((item: any) => new Date(item._id) >= thirtyDaysAgo);

      return createApiResponse(filtered, 'Lấy dữ liệu biểu đồ thành công', HttpStatus.OK);
    }

    // Bookings count chart - 30 ngày gần nhất
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const chartData = await this.bookingModel.aggregate([
      { 
        $match: { 
          status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+07:00' } },
          value: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    return createApiResponse(chartData, 'Lấy dữ liệu biểu đồ thành công', HttpStatus.OK);
  }

  async predictRevenue(ownerId: string, venueId?: string): Promise<ApiResponseType> {
    const ownerObjectId = new Types.ObjectId(ownerId);
    const venueFilter: any = { ownerId: ownerObjectId };
    if (venueId) {
      if (!Types.ObjectId.isValid(venueId)) {
        throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
      }
      venueFilter._id = new Types.ObjectId(venueId);
    }

    const venues = await this.venueModel.find(venueFilter).exec();
    const venueIds = venues.map(v => v._id);

    // Get historical revenue for the last 30 days
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const historicalData = await this.bookingModel.aggregate([
      {
        $match: {
          venueId: { $in: venueIds },
          createdAt: { $gte: last30Days }
        }
      },
      ...this.getRevenueMatchStage(),
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$finalPrice' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const totalHistoricalRevenue = historicalData.reduce((acc, curr) => acc + curr.revenue, 0);
    const averageDailyRevenue = historicalData.length > 0 ? totalHistoricalRevenue / historicalData.length : 0;

    // Simulate AI Prediction for next 7 days
    const predictions = [];
    let predictedTotal = 0;
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);

      // Add some variance and weekend boost
      const dayOfWeek = nextDay.getDay();
      const boost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.4 : 1.0; // 40% more on weekends
      const randomVariance = 0.9 + Math.random() * 0.2; // +/- 10%

      const dailyPrediction = Math.round(averageDailyRevenue * boost * randomVariance);
      predictedTotal += dailyPrediction;

      predictions.push({
        date: nextDay.toISOString().split('T')[0],
        predictedRevenue: dailyPrediction,
        confidence: 0.85 + (Math.random() * 0.1) // 85-95% confidence
      });
    }

    const insights = [
      `Dự kiến doanh thu tuần tới đạt ${predictedTotal.toLocaleString('vi-VN')} VND.`,
      `Tăng trưởng dự kiến khoảng ${historicalData.length > 0 ? '12%' : '0%'} so với tuần trước.`,
      `Thứ 7 và Chủ Nhật vẫn là những ngày có hiệu suất cao nhất.`,
      `Khuyến nghị: Bạn có thể cân nhắc tăng nhẹ giá giờ vàng để tối ưu hóa lợi nhuận.`
    ];

    return createApiResponse({
      predictions,
      summary: {
        totalPredicted: predictedTotal,
        averageDaily: Math.round(predictedTotal / 7),
        period: '7 days'
      },
      insights
    }, 'Dự đoán doanh thu thành công', HttpStatus.OK);
  }

  private async getCourtIds(ownerId: string, venueId?: string): Promise<Types.ObjectId[]> {
    const venueFilter: any = { ownerId: ownerId };
    if (venueId) venueFilter._id = venueId;

    const venues = await this.venueModel.find(venueFilter).exec();
    const venueIds = venues.map(v => v._id);
    const courts = await this.courtModel.find({ venueId: { $in: venueIds } }).exec();
    return courts.map(c => c._id as Types.ObjectId);
  }

  async getAdminRevenueReport(query: any): Promise<ApiResponseType> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build match filter - lấy bookings CONFIRMED hoặc COMPLETED
    const matchFilter: any = {
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
    };

    // Chỉ lọc theo ngày nếu có truyền startDate và endDate
    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      matchFilter.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Lấy bookings trực tiếp với status CONFIRMED hoặc COMPLETED
    const pipeline: any[] = [
      { $match: matchFilter },
      // Lookup venue
      {
        $lookup: {
          from: 'venues',
          localField: 'venueId',
          foreignField: '_id',
          as: 'venue',
        },
      },
      { $unwind: { path: '$venue', preserveNullAndEmptyArrays: true } },
      // Lookup owner
      {
        $lookup: {
          from: 'users',
          localField: 'venue.ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
      // Lookup player (user who booked)
      {
        $lookup: {
          from: 'users',
          localField: 'playerId',
          foreignField: '_id',
          as: 'player',
        },
      },
      {
        $unwind: {
          path: '$player',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup payment để lấy phương thức thanh toán
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'bookingId',
          as: 'paymentInfo',
        },
      },
    ];

    // Filter by venueId
    if (query.venueId && query.venueId !== 'all') {
      pipeline.push({
        $match: { 'venue._id': new Types.ObjectId(query.venueId) }
      });
    }

    // Filter by ownerId
    if (query.ownerId && query.ownerId !== 'all') {
      pipeline.push({
        $match: { 'owner._id': new Types.ObjectId(query.ownerId) }
      });
    }

    // Stats pipeline - tính tổng từ booking.finalPrice theo phương thức thanh toán
    const statsPipeline = [
      ...pipeline,
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalPrice' },
          count: { $sum: 1 },
          cashRevenue: {
            $sum: {
              $cond: [
                { $eq: [{ $arrayElemAt: ['$paymentInfo.method', 0] }, 'CASH'] },
                '$finalPrice',
                0
              ]
            }
          },
          vnpayRevenue: {
            $sum: {
              $cond: [
                { $eq: [{ $arrayElemAt: ['$paymentInfo.method', 0] }, 'VNPAY'] },
                '$finalPrice',
                0
              ]
            }
          },
          momoRevenue: {
            $sum: {
              $cond: [
                { $eq: [{ $arrayElemAt: ['$paymentInfo.method', 0] }, 'MOMO'] },
                '$finalPrice',
                0
              ]
            }
          }
        }
      }
    ];

    // Pagination and sorting
    const dataPipeline = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          amount: '$finalPrice',
          method: { $arrayElemAt: ['$paymentInfo.method', 0] },
          transaction_id: { $arrayElemAt: ['$paymentInfo.transactionId', 0] },
          createdAt: 1,
          status: 1,
          finalPrice: 1,
          customerName: { $ifNull: ['$customerName', '$player.fullName'] },
          customerPhone: { $ifNull: ['$customerPhone', '$player.phone'] },
          venue: {
            _id: '$venue._id',
            name: '$venue.name'
          },
          owner: {
            _id: '$owner._id',
            fullName: '$owner.fullName',
            email: '$owner.email'
          }
        }
      }
    ];

    const [bookings, statsResult] = await Promise.all([
      this.bookingModel.aggregate(dataPipeline).exec(),
      this.bookingModel.aggregate(statsPipeline).exec()
    ]);

    const stats = statsResult[0] || {
      totalRevenue: 0,
      count: 0,
      cashRevenue: 0,
      vnpayRevenue: 0,
      momoRevenue: 0
    };

    // Map lại data để tương thích với frontend
    const transactions = bookings.map((b: any) => ({
      _id: b._id,
      amount: b.amount,
      method: b.method || 'CASH',
      transaction_id: b.transaction_id,
      createdAt: b.createdAt,
      status: b.status,
      booking: {
        _id: b._id,
        customerName: b.customerName,
        customerPhone: b.customerPhone
      },
      venue: b.venue,
      owner: b.owner
    }));

    return createApiResponse({
      transactions,
      stats,
      pagination: {
        total: stats.count,
        page,
        limit,
        totalPages: Math.ceil(stats.count / limit),
      }
    }, 'Lấy báo cáo doanh thu thành công', HttpStatus.OK);
  }

  async getOwnerRevenueChart(ownerId: string, query: any): Promise<ApiResponseType> {
    const ownerObjectId = new Types.ObjectId(ownerId);

    // Get venue IDs for this owner
    let venueFilter: any = { ownerId: ownerObjectId };
    if (query.venueId && query.venueId !== 'all') {
      venueFilter._id = new Types.ObjectId(query.venueId);
    }
    const venues = await this.venueModel.find(venueFilter).exec();
    const venueIds = venues.map(v => v._id);

    if (venueIds.length === 0) {
      return createApiResponse([], 'Lấy dữ liệu biểu đồ doanh thu thành công', HttpStatus.OK);
    }

    // Build date filter - mặc định 30 ngày nếu không có
    let startDate: Date;
    let endDate: Date;

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Lấy bookings CONFIRMED hoặc COMPLETED
    const bookings = await this.bookingModel.find({
      venueId: { $in: venueIds },
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
    }).select('_id').exec();

    const bookingIds = bookings.map(b => b._id);

    if (bookingIds.length === 0) {
      return createApiResponse([], 'Lấy dữ liệu biểu đồ doanh thu thành công', HttpStatus.OK);
    }

    // Lấy booking details để group theo ngày đặt sân (bookingDate)
    const chartData = await this.bookingDetailModel.aggregate([
      {
        $match: {
          bookingId: { $in: bookingIds },
          bookingDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'bookingId',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          revenue: '$revenue',
          count: '$count',
          _id: 0
        }
      }
    ]);

    return createApiResponse(chartData, 'Lấy dữ liệu biểu đồ doanh thu thành công', HttpStatus.OK);
  }

  private getRevenueMatchStage(): any[] {
    return [
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'bookingId',
          as: 'payments'
        }
      },
      {
        $match: {
          $or: [
            { status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] } },
            { 'payments.status': { $in: ['SUCCESS', 'PAID'] } }
          ]
        }
      }
    ];
  }
}
