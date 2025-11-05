import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityLog.name, schema: ActivityLogSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ActivityLogController],
  providers: [ActivityLogService],
  exports: [ActivityLogService, MongooseModule],
})
export class ActivityLogModule {}
