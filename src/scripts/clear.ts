import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederService } from '../modules/seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seederService = app.get(SeederService);

  try {
    console.log('🗑️ Bắt đầu xóa dữ liệu...');
    await seederService.clearAll();
    console.log('✅ Hoàn thành xóa dữ liệu!');
  } catch (error) {
    console.error('❌ Lỗi khi xóa dữ liệu:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
