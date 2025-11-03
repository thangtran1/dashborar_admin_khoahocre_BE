import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): {
    status: string;
    message: string;
    timestamp: string;
    version: string;
  } {
    return {
      status: 'OK',
      message: 'TVT System Admin API is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
