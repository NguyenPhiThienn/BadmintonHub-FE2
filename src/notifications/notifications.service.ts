import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (!admin.apps.length) {
        const serviceAccountPath = path.resolve(__dirname, '..', 'config', 'firebase-service-account.json');
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  async sendAndSaveNotification(
    userId: string,
    title: string,
    body: string,
    type: NotificationType,
    data?: any,
  ) {
    try {
      if (!Types.ObjectId.isValid(userId)) return false;

      // 1. Save to DB
      const notification = await this.notificationModel.create({
        userId: new Types.ObjectId(userId),
        title,
        body,
        type,
        data: data || {},
      });

      // 2. Fetch User FCM Tokens
      const user = await this.userModel.findById(userId).exec();
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        return true; // Notification saved, but user has no tokens to receive push
      }

      // 3. Send Push Notification
      const message: admin.messaging.MulticastMessage = {
        tokens: user.fcmTokens,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          type,
          notificationId: notification._id.toString(),
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      // Cleanup invalid tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(user.fcmTokens[idx]);
          }
        });
        if (failedTokens.length > 0) {
          await this.userModel.findByIdAndUpdate(userId, {
            $pullAll: { fcmTokens: failedTokens }
          });
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Error sending and saving notification:', error);
      return false;
    }
  }

  async getMyNotifications(userId: string, page: number = 1, limit: number = 20): Promise<ApiResponseType> {
    const skip = (page - 1) * limit;

    const notifications = await this.notificationModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId) });
    const unreadCount = await this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId), isRead: false });

    return createApiResponse(
      { notifications, total, page, unreadCount, totalPages: Math.ceil(total / limit) },
      'Lấy danh sách thông báo thành công',
      HttpStatus.OK,
    );
  }

  async markAsRead(notificationId: string, userId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(notificationId)) {
      return createApiResponse(null, 'ID không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId: new Types.ObjectId(userId) },
      { $set: { isRead: true } }
    ).exec();

    return createApiResponse(null, 'Đánh dấu đã đọc thành công', HttpStatus.OK);
  }

  async markAllAsRead(userId: string): Promise<ApiResponseType> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    ).exec();

    return createApiResponse(null, 'Đánh dấu tất cả đã đọc thành công', HttpStatus.OK);
  }
}
