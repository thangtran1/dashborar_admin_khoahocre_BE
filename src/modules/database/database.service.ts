import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as path from 'path';
import mongoose, { Connection, Types } from 'mongoose';
import { Db, OptionalId, Document } from 'mongodb';
import { Response } from 'express';

export interface AdminHistory {
  action: 'backup' | 'restore' | 'delete';
  timestamp: string;
  filename?: string;
  admin?: string; // nếu muốn track user
}

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');
  private history: AdminHistory[] = [];

  constructor(@InjectConnection() private readonly connection: Connection) {}

  private getDb(): Db {
    if (this.connection.readyState !== mongoose.ConnectionStates.connected) {
      throw new InternalServerErrorException('Database chưa kết nối.');
    }
    return this.connection.db as Db;
  }

  async getInfo() {
    const db = this.getDb();
    const collections = await db.listCollections().toArray();
    const stats = await db.stats();
    return {
      success: true,
      message: 'Lấy thông tin cơ sở dữ liệu thành công.',
      data: {
        dbName: db.databaseName,
        collections: collections.map((c) => c.name),
        collectionsCount: collections.length,
        dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
        storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
        indexes: stats.indexes as unknown as number[],
        timestamp: new Date().toISOString(),
      },
    };
  }

  async backup(admin?: string): Promise<{ filePath: string }> {
    const db = this.getDb();
    if (!fs.existsSync(this.backupDir)) fs.mkdirSync(this.backupDir);

    const collections = await db.listCollections().toArray();
    const data: Record<string, unknown[]> = {};

    for (const coll of collections) {
      const docs = await db.collection(coll.name).find().toArray();
      data[coll.name] = docs;
    }

    const fileName = `backup-${Date.now()}.json`;
    const filePath = path.join(this.backupDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    this.history.push({
      action: 'backup',
      timestamp: new Date().toISOString(),
      filename: fileName,
      admin,
    });
    this.logger.log(`Backup created: ${fileName}`);
    return { filePath };
  }

  async delete(admin?: string): Promise<{ success: boolean; message: string }> {
    const db = this.getDb();
    const collections = await db.listCollections().toArray();

    let hasData = false;
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      if (count > 0) {
        hasData = true;
        await db.collection(coll.name).deleteMany({});
      }
    }

    if (hasData) {
      this.history.push({
        action: 'delete',
        timestamp: new Date().toISOString(),
        admin,
      });
      return { success: true, message: 'Đã xóa toàn bộ dữ liệu!' };
    } else {
      return { success: true, message: 'Không có dữ liệu để xóa!' };
    }
  }

  async restore(file: Express.Multer.File, admin?: string) {
    const db = this.getDb();
    const data = JSON.parse(file.buffer.toString()) as Record<string, any[]>;

    for (const [collectionName, docs] of Object.entries(data)) {
      const collection = db.collection(collectionName);
      await collection.deleteMany({});

      if (Array.isArray(docs) && docs.length > 0) {
        const docsWithObjectId = docs.map((doc) => {
          // Chỉ convert _id nếu nó là string
          if (doc._id && typeof doc._id === 'string') {
            return { ...doc, _id: new Types.ObjectId(doc._id) };
          }
          return doc;
        });

        await collection.insertMany(docsWithObjectId as OptionalId<Document>[]);
      }
    }

    this.history.push({
      action: 'restore',
      timestamp: new Date().toISOString(),
      admin,
    });

    return { success: true, message: 'Đã khôi phục dữ liệu thành công!' };
  }

  // 2. Lấy lịch sử thao tác admin
  listBackups() {
    if (!fs.existsSync(this.backupDir))
      return {
        success: true,
        message: 'Không có backup.',
        data: [],
      };
    const files = fs.readdirSync(this.backupDir);
    const backups = files.map((file) => {
      const stats = fs.statSync(path.join(this.backupDir, file));
      return {
        filename: file,
        createdAt: stats.birthtime.toISOString(),
        size: `${(stats.size / 1024).toFixed(2)} KB`,
      };
    });
    return {
      success: true,
      message: 'Lấy danh sách backup thành công.',
      data: backups,
    };
  }

  deleteBackupFile(filename: string) {
    const filePath = path.join(this.backupDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Không tìm thấy file backup: ${filename}`);
    }

    fs.unlinkSync(filePath);
    this.logger.log(`Backup file deleted: ${filename}`);

    return {
      success: true,
      message: `Đã xóa file backup ${filename} thành công.`,
    };
  }

  /**
   * 💾 Tải file backup về
   */
  async downloadBackupFile(filename: string, res: Response) {
    const filePath = path.join(this.backupDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Không tìm thấy file backup: ${filename}`);
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        this.logger.error(`Lỗi khi tải file: ${filename}`, err);
        throw new InternalServerErrorException('Không thể tải file backup.');
      }
    });
  }

  /**
   * 👁️ Xem chi tiết nội dung file backup trước khi tải
   */
  viewBackupFile(filename: string) {
    const filePath = path.join(this.backupDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Không tìm thấy file backup: ${filename}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    return {
      success: true,
      message: `Xem nội dung file backup ${filename} thành công.`,
      data: jsonData,
    };
  }
}
