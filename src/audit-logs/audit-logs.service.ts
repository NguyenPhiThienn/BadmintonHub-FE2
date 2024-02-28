import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction } from './schemas/audit-log.schema';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async create(data: {
    action: AuditAction;
    performedBy: string;
    targetUser: string;
    targetEmail: string;
    details?: Record<string, any>;
    ipAddress?: string;
  }): Promise<AuditLog> {
    return this.auditLogModel.create(data);
  }

  async findByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ targetUser: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByAdmin(adminId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ performedBy: adminId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findAll(limit: number = 100, skip: number = 0): Promise<AuditLog[]> {
    return this.auditLogModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
}
