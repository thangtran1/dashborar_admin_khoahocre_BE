import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FilterFeedbackDto } from './dto/filter-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private feedbackModel: Model<FeedbackDocument>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<FeedbackDocument> {
    const feedback = new this.feedbackModel(createFeedbackDto);
    return await feedback.save();
  }

  async findAll(filterDto: FilterFeedbackDto): Promise<{
    feedbacks: FeedbackDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, startDate, endDate } = filterDto;
    const skip = (page - 1) * limit;

    // Build query filter
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate)
        (filter.createdAt as Record<string, any>).$gte = new Date(startDate);
      if (endDate)
        (filter.createdAt as Record<string, any>).$lte = new Date(endDate);
    }

    const [feedbacks, total] = await Promise.all([
      this.feedbackModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.feedbackModel.countDocuments(filter).exec(),
    ]);

    return {
      feedbacks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  async findOne(id: string): Promise<FeedbackDocument> {
    const feedback = await this.feedbackModel.findById(id).exec();

    if (!feedback) {
      throw new NotFoundException('Không tìm thấy feedback');
    }

    return feedback;
  }

  async remove(id: string): Promise<void> {
    const result = await this.feedbackModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Không tìm thấy feedback để xóa');
    }
  }
}
