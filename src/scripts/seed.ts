import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederService } from '../modules/seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seederService = app.get(SeederService);

  try {
    console.log('🌱 Bắt đầu seed dữ liệu...');
    await seederService.seedAll();
    console.log('✅ Hoàn thành seed dữ liệu!');
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
