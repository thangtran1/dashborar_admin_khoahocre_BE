import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { BannerModule } from '../banner/banner.module';
import { UsersModule } from '../users/users.module';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    BannerModule,
    UsersModule,
    SystemModule,
  ],
  controllers: [SeederController],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
