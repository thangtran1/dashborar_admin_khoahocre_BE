import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FilterFeedbackDto } from './dto/filter-feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * API cho người dùng gửi feedback từ form contact
   * POST /feedback
   */
  @Post()
  async create(@Body() createFeedbackDto: CreateFeedbackDto) {
    const feedback = await this.feedbackService.create(createFeedbackDto);
    return {
      success: true,
      message: 'Gửi feedback thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
      data: feedback,
    };
  }

  /**
   * Lấy danh sách feedback (Admin)
   * GET /feedback/admin
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() filterDto: FilterFeedbackDto) {
    const result = await this.feedbackService.findAll(filterDto);
    return {
      success: true,
      message: 'Lấy danh sách feedback thành công',
      data: result.feedbacks,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }


  /**
   * Xem chi tiết feedback (Admin)
   * GET /feedback/admin/:id
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const feedback = await this.feedbackService.findOne(id);
    return {
      success: true,
      message: 'Xem chi tiết feedback thành công',
      data: feedback,
    };
  }


  /**
   * Xóa feedback (Admin)
   * DELETE /feedback/admin/:id
   */
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.feedbackService.remove(id);
    return {
      success: true,
      message: 'Xóa feedback thành công',
    };
  }
}
