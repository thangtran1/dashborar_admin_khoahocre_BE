import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Maintenance,
  MaintenanceDocument,
} from '../schemas/maintenance.schema';
import { maintenanceSeeds } from './maintenance.seed';

@Injectable()
export class MaintenanceSeedService {
  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<MaintenanceDocument>,
  ) {}

  async seed() {
    try {
      // Xóa tất cả dữ liệu cũ
      await this.maintenanceModel.deleteMany({});

      // Thêm dữ liệu mới
      const maintenances =
        await this.maintenanceModel.insertMany(maintenanceSeeds);

      console.log('🌱 Seeded maintenance data successfully!');
      return maintenances;
    } catch (error) {
      console.error('Error seeding maintenance data:', error);
      throw error;
    }
  }

  async clear() {
    try {
      await this.maintenanceModel.deleteMany({});
      console.log('🧹 Cleared maintenance data successfully!');
    } catch (error) {
      console.error('Error clearing maintenance data:', error);
      throw error;
    }
  }
}
