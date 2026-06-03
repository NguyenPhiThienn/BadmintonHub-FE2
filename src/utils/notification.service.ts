import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (!admin.apps.length) {
        // Resolve path to the service account JSON file
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
