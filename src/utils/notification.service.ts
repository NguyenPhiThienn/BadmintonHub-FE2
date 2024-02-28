import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor() {}

  async sendPushNotification(token: string, title: string, body: string) {
    this.logger.debug(
      `Sending push notification to ${token}: ${title} - ${body}`,
    );
  }
}
