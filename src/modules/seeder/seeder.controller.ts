import { Controller, Post, Delete } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seeder')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post('seed')
  async seedData() {
    await this.seederService.seedAll();
    return {
      message: 'Dữ liệu đã được seed thành công!',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('clear')
  async clearData() {
    await this.seederService.clearAll();
    return {
      message: 'Dữ liệu đã được xóa thành công!',
      timestamp: new Date().toISOString(),
    };
  }
}
