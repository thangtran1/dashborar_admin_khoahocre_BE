import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address, AddressDocument } from './schemas/address.schema';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
  ) {}

  async create(userId: string, dto: CreateAddressDto) {
    const addressCount = await this.addressModel.countDocuments({
      member_id: userId,
    });
    if (addressCount >= 3) {
      throw new BadRequestException(
        'Bạn đã đạt giới hạn tối đa 10 địa chỉ. Vui lòng xóa bớt địa chỉ cũ để thêm mới.',
      );
    }

    if (!dto.full_address) {
      throw new BadRequestException('Thông tin địa chỉ không được để trống');
    }

    const existing = await this.addressModel.findOne({
      member_id: userId,
      full_address: dto.full_address,
    });
    if (existing) {
      throw new ConflictException(
        'Địa chỉ này đã tồn tại trong danh sách của bạn',
      );
    }

    const isFirstAddress = addressCount === 0;
    const shouldBeDefault = isFirstAddress ? true : dto.is_default;

    if (shouldBeDefault) {
      await this.addressModel.updateMany(
        { member_id: userId },
        { is_default: false },
      );
    }

    const address = new this.addressModel({
      ...dto,
      is_default: shouldBeDefault,
      member_id: userId,
    });

    return address.save();
  }

  async findAll(userId: string, query: { page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [list, total] = await Promise.all([
      this.addressModel
        .find({ member_id: userId })
        .populate({
          path: 'member_id',
          select: 'name email phone',
        })
        .sort({ is_default: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.addressModel.countDocuments({ member_id: userId }),
    ]);

    return { list, total, page, limit };
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    // 1. Kiểm tra ID có đúng định dạng ObjectId không (tránh lỗi 500 của Mongo)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('ID địa chỉ không hợp lệ');
    }

    // 2. Nếu update thành địa chỉ mặc định, reset các cái khác
    if (dto.is_default) {
      await this.addressModel.updateMany(
        { member_id: userId, _id: { $ne: id } },
        { is_default: false },
      );
    }

    const updatedAddress = await this.addressModel.findOneAndUpdate(
      { _id: id, member_id: userId },
      dto,
      { new: true },
    );

    // 3. Nếu truyền ID đúng định dạng nhưng không tìm thấy record
    if (!updatedAddress) {
      throw new NotFoundException(
        'Không tìm thấy địa chỉ hoặc bạn không có quyền sửa',
      );
    }

    return updatedAddress;
  }

  async remove(id: string, userId: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('ID địa chỉ không hợp lệ');
    }

    const deleted = await this.addressModel.findOneAndDelete({
      _id: id,
      member_id: userId,
    });

    if (!deleted) {
      throw new NotFoundException('Không tìm thấy địa chỉ để xóa');
    }

    return deleted;
  }

  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const filter = search
      ? { full_address: { $regex: search, $options: 'i' } }
      : {};

    const [data, total] = await Promise.all([
      this.addressModel
        .find(filter)
        .skip(skip)
        .populate({
          path: 'member_id',
          select: 'name email phone',
        })
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.addressModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  // Admin xóa địa chỉ của bất kỳ ai
  async removeByAdmin(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    const deleted = await this.addressModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Không tìm thấy địa chỉ');
    return deleted;
  }
}
