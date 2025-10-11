import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ToggleBannerDto } from './dto/toggle-banner.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<BannerDocument> {
    try {
      // Tự động tính thứ tự nếu không được cung cấp hoặc bị trùng
      let order = createBannerDto.order ?? 0;

      if (order === 0) {
        // Nếu order = 0, tự động lấy order cao nhất + 1
        const maxOrderBanner = await this.bannerModel
          .findOne()
          .sort({ order: -1 })
          .exec();
        order = (maxOrderBanner?.order || 0) + 1;
      } else {
        // Kiểm tra xem order đã tồn tại chưa
        const existingBanner = await this.bannerModel.findOne({ order }).exec();

        if (existingBanner) {
          // Nếu order đã tồn tại, đẩy tất cả banner có order >= lên 1 bậc
          await this.bannerModel
            .updateMany({ order: { $gte: order } }, { $inc: { order: 1 } })
            .exec();
        }
      }

      const banner = new this.bannerModel({
        content: createBannerDto.content,
        isActive: createBannerDto.isActive ?? true,
        order,
      });

      return await banner.save();
    } catch (error) {
      throw new BadRequestException(
        'Không thể tạo banner: ' + (error as Error).message,
      );
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    banners: BannerDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [banners, total] = await Promise.all([
      this.bannerModel
        .find()
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bannerModel.countDocuments().exec(),
    ]);

    return {
      banners,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findActive(): Promise<BannerDocument[]> {
    return this.bannerModel
      .find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<BannerDocument> {
    const banner = await this.bannerModel.findById(id).exec();

    if (!banner) {
      throw new NotFoundException('Không tìm thấy banner');
    }

    return banner;
  }

  async update(
    id: string,
    updateBannerDto: UpdateBannerDto,
  ): Promise<BannerDocument> {
    const banner = await this.bannerModel
      .findByIdAndUpdate(id, updateBannerDto, { new: true })
      .exec();

    if (!banner) {
      throw new NotFoundException('Không tìm thấy banner để cập nhật');
    }

    return banner;
  }

  async toggle(
    id: string,
    toggleBannerDto: ToggleBannerDto,
  ): Promise<BannerDocument> {
    const banner = await this.bannerModel
      .findByIdAndUpdate(
        id,
        { isActive: toggleBannerDto.isActive },
        { new: true },
      )
      .exec();

    if (!banner) {
      throw new NotFoundException(
        'Không tìm thấy banner để thay đổi trạng thái',
      );
    }

    return banner;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bannerModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Không tìm thấy banner để xóa');
    }
  }

  async updateOrder(id: string, newOrder: number): Promise<BannerDocument> {
    const banner = await this.bannerModel.findById(id).exec();

    if (!banner) {
      throw new NotFoundException('Không tìm thấy banner để cập nhật thứ tự');
    }

    const oldOrder = banner.order;

    // Kiểm tra xem order mới đã tồn tại chưa (trừ chính banner này)
    const existingBanner = await this.bannerModel
      .findOne({ order: newOrder, _id: { $ne: id } })
      .exec();

    if (existingBanner) {
      if (newOrder > oldOrder) {
        // Di chuyển xuống: giảm order của các banner trong khoảng (oldOrder, newOrder]
        await this.bannerModel
          .updateMany(
            { order: { $gt: oldOrder, $lte: newOrder } },
            { $inc: { order: -1 } },
          )
          .exec();
      } else {
        // Di chuyển lên: tăng order của các banner trong khoảng [newOrder, oldOrder)
        await this.bannerModel
          .updateMany(
            { order: { $gte: newOrder, $lt: oldOrder } },
            { $inc: { order: 1 } },
          )
          .exec();
      }
    }

    // Cập nhật order cho banner hiện tại
    const updatedBanner = await this.bannerModel
      .findByIdAndUpdate(id, { order: newOrder }, { new: true })
      .exec();

    if (!updatedBanner) {
      throw new NotFoundException('Không thể cập nhật thứ tự banner');
    }

    return updatedBanner;
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active] = await Promise.all([
      this.bannerModel.countDocuments().exec(),
      this.bannerModel.countDocuments({ isActive: true }).exec(),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }
}
