import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Maintenance,
  MaintenanceDocument,
  MaintenanceStatus,
} from './schemas/maintenance.schema';

@Injectable()
export class MaintenanceSchedulerService {
  private readonly logger = new Logger(MaintenanceSchedulerService.name);

  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<MaintenanceDocument>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleMaintenanceSchedule() {
    const now = new Date();

    // Kiểm tra và bắt đầu các bảo trì đã đến giờ
    await this.startScheduledMaintenance(now);

    // Kiểm tra và kết thúc các bảo trì đã hết giờ
    await this.completeExpiredMaintenance(now);
  }

  private async startScheduledMaintenance(now: Date) {
    try {
      // Tìm các bảo trì đã đến giờ bắt đầu
      const maintenanceToStart = await this.maintenanceModel.find({
        status: MaintenanceStatus.SCHEDULED,
        startTime: { $lte: now },
        endTime: { $gt: now },
      });

      // Dừng bảo trì đang hoạt động (nếu có)
      if (maintenanceToStart.length > 0) {
        await this.stopActiveMaintenance();
      }

      // Bắt đầu các bảo trì mới
      for (const maintenance of maintenanceToStart) {
        maintenance.status = MaintenanceStatus.IN_PROGRESS;
        maintenance.isActive = true;
        await maintenance.save();
        this.logger.log(`Tự động bắt đầu bảo trì: ${maintenance._id}`);
      }
    } catch (error) {
      this.logger.error('Lỗi khi bắt đầu bảo trì tự động:', error);
    }
  }

  private async completeExpiredMaintenance(now: Date) {
    try {
      // Tìm các bảo trì đã hết giờ
      const maintenanceToComplete = await this.maintenanceModel.find({
        status: MaintenanceStatus.IN_PROGRESS,
        endTime: { $lte: now },
      });

      // Kết thúc các bảo trì đã hết giờ
      for (const maintenance of maintenanceToComplete) {
        maintenance.status = MaintenanceStatus.COMPLETED;
        maintenance.isActive = false;
        maintenance.duration = Math.floor(
          (now.getTime() - maintenance.startTime.getTime()) / (60 * 1000),
        );
        await maintenance.save();
        this.logger.log(`Tự động kết thúc bảo trì: ${maintenance._id}`);
      }
    } catch (error) {
      this.logger.error('Lỗi khi kết thúc bảo trì tự động:', error);
    }
  }

  private async stopActiveMaintenance() {
    const now = new Date();
    const activeMaintenance = await this.maintenanceModel.findOne({
      isActive: true,
    });

    if (activeMaintenance) {
      activeMaintenance.status = MaintenanceStatus.COMPLETED;
      activeMaintenance.endTime = now;
      activeMaintenance.isActive = false;
      activeMaintenance.duration = Math.floor(
        (now.getTime() - activeMaintenance.startTime.getTime()) / (60 * 1000),
      );
      await activeMaintenance.save();
      this.logger.log(`Dừng bảo trì đang hoạt động: ${activeMaintenance._id}`);
    }
  }
}
