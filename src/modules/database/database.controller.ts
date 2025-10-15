import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Res,
} from '@nestjs/common';
import { DatabaseService } from './database.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

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

  @Delete('backups/:filename')
  deleteBackup(@Param('filename') filename: string) {
    return this.databaseService.deleteBackupFile(filename);
  }

  // 🔹 Tải file backup
  @Get('backups/download/:filename')
  async downloadBackup(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    return this.databaseService.downloadBackupFile(filename, res);
  }

  // 🔹 Xem nội dung file backup
  @Get('backups/view/:filename')
  async viewBackup(@Param('filename') filename: string) {
    return this.databaseService.viewBackupFile(filename);
  }
}
