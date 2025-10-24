import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { Maintenance, MaintenanceSchema } from './schemas/maintenance.schema';
import { MaintenanceSeedService } from './seeds/maintenance-seed.service';
import { MaintenanceSeeder } from './maintenance.seeder';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Maintenance.name, schema: MaintenanceSchema },
    ]),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService, MaintenanceSeedService, MaintenanceSeeder],
  exports: [MaintenanceService, MaintenanceSeeder],
})
export class MaintenanceModule {}
