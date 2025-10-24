import { Injectable, Logger } from '@nestjs/common';
import { MaintenanceSeedService } from './seeds/maintenance-seed.service';

@Injectable()
export class MaintenanceSeeder {
  private readonly logger = new Logger(MaintenanceSeeder.name);

  constructor(
    private readonly maintenanceSeedService: MaintenanceSeedService,
  ) {}

  async seed() {
    try {
      this.logger.log('Seeding maintenance data...');
      await this.maintenanceSeedService.seed();
      this.logger.log('✅ Seeded maintenance data');
    } catch (error) {
      this.logger.error('Failed to seed maintenance data', error);
      throw error;
    }
  }

  async clear() {
    try {
      this.logger.log('Clearing maintenance data...');
      await this.maintenanceSeedService.clear();
      this.logger.log('✅ Cleared maintenance data');
    } catch (error) {
      this.logger.error('Failed to clear maintenance data', error);
      throw error;
    }
  }
}
