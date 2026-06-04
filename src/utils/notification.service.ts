import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
          this.logger.warn('Firebase environment variables not set. Push notifications disabled.');
          return;
        }

        const serviceAccount: admin.ServiceAccount = {
          projectId,
          privateKey,
          clientEmail,
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  async sendPushNotification(token: string, title: string, body: string, data?: any) {
    try {
      if (!token) return;

      const message: admin.messaging.Message = {
        token: token,
        notification: {
          title: title,
          body: body,
        },
        data: data || {},
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.debug(`Successfully sent push notification: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending push notification to ${token}:`, error);
      return false;
    }
  }

  async sendMulticastNotification(tokens: string[], title: string, body: string, data?: any) {
    if (!tokens || tokens.length === 0) return;

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: tokens,
        notification: {
          title: title,
          body: body,
        },
        data: data || {},
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.debug(`${response.successCount} messages were sent successfully`);
      return response;
    } catch (error) {
      this.logger.error('Error sending multicast push notification:', error);
      return null;
    }
  }
}
