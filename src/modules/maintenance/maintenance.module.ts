import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { Maintenance, MaintenanceSchema } from './schemas/maintenance.schema';
import { MaintenanceSeedService } from './seeds/maintenance-seed.service';
import { MaintenanceSeeder } from './maintenance.seeder';
import { MaintenanceSchedulerService } from './maintenance-scheduler.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Maintenance.name, schema: MaintenanceSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [MaintenanceController],
  providers: [
    MaintenanceService,
    MaintenanceSeedService,
    MaintenanceSeeder,
    MaintenanceSchedulerService,
  ],
  exports: [MaintenanceService, MaintenanceSeeder],
})
export class MaintenanceModule {}
