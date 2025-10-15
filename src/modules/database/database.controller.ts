import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Query,
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
  listBackups(
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    return this.databaseService.listBackups({
      search,
      startDate,
      endDate,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  }

  @Delete('backups/:filename')
  deleteBackup(@Param('filename') filename: string) {
    return this.databaseService.deleteBackupFile(filename);
  }

  // 🔹 Tải file backup
  @Get('backups/download-json/:filename')
  downloadBackupJson(@Param('filename') filename: string) {
    return this.databaseService.downloadBackupFileAsJson(filename);
  }

  // 🔹 Xem nội dung file backup
  @Get('backups/view/:filename')
  viewBackup(@Param('filename') filename: string) {
    return this.databaseService.viewBackupFile(filename);
  }
}
