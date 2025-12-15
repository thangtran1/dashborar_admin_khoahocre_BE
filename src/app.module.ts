import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BannerModule } from './modules/banner/banner.module';
import { SystemModule } from './modules/system/system.module';
import { DatabaseModule } from './modules/database/database.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ProductsModule } from './modules/products/products.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    AuthModule,
    UsersModule,
    SeederModule,
    ChatModule,
    NotificationsModule,
    BannerModule,
    SystemModule,
    DatabaseModule,
    MaintenanceModule,
    FeedbackModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    WishlistModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
