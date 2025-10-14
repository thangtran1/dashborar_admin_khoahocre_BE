import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { DatabaseService } from './database.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('info')
  async getDatabaseInfo() {
    return this.databaseService.getInfo();
  }

  @Post('backup')
  async backupDatabase() {
    const filePath = await this.databaseService.backup();
    return {
      message: 'Đã tạo bản sao lưu thành công!',
      success: true,
      filePath,
    };
  }

  @Post('restore')
  @UseInterceptors(FileInterceptor('file'))
  async restoreDatabase(@UploadedFile() file: Express.Multer.File) {
    await this.databaseService.restore(file);
    return { message: 'Khôi phục dữ liệu thành công!', success: true };
  }

  @Delete('delete')
  async deleteDatabase() {
    return this.databaseService.delete();
  }

  @Get('backups')
  listBackups() {
    return this.databaseService.listBackups();
  }
}
