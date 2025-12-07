import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name)
    private brandModel: Model<BrandDocument>,
  ) {}

  // Tạo slug từ tên
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async create(createBrandDto: CreateBrandDto): Promise<BrandDocument> {
    const slug = createBrandDto.slug || this.generateSlug(createBrandDto.name);

    // Kiểm tra slug đã tồn tại chưa
    const existingBrand = await this.brandModel.findOne({
      slug,
      isDeleted: false,
    });

    if (existingBrand) {
      throw new ConflictException('Brand với slug này đã tồn tại');
    }

    const brand = new this.brandModel({
      ...createBrandDto,
      slug,
    });

    return brand.save();
  }

  async findAll(query: QueryBrandDto) {
    const {
      search,
      status,
      isFeatured,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = { isDeleted: false };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [data, total] = await Promise.all([
      this.brandModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.brandModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<BrandDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Brand không tồn tại');
    }

    const brand = await this.brandModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!brand) {
      throw new NotFoundException('Brand không tồn tại');
    }

    return brand;
  }

  async findBySlug(slug: string): Promise<BrandDocument> {
    const brand = await this.brandModel.findOne({
      slug,
      isDeleted: false,
    });

    if (!brand) {
      throw new NotFoundException('Brand không tồn tại');
    }

    return brand;
  }

  async update(
    id: string,
    updateBrandDto: UpdateBrandDto,
  ): Promise<BrandDocument> {
    const brand = await this.findOne(id);

    // Nếu có cập nhật slug, kiểm tra trùng lặp
    if (updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
      const existingBrand = await this.brandModel.findOne({
        slug: updateBrandDto.slug,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existingBrand) {
        throw new ConflictException('Brand với slug này đã tồn tại');
      }
    }

    // Nếu cập nhật name mà không có slug, tự động tạo slug mới
    if (updateBrandDto.name && !updateBrandDto.slug) {
      updateBrandDto.slug = this.generateSlug(updateBrandDto.name);
    }

    Object.assign(brand, updateBrandDto);
    return brand.save();
  }

  async remove(id: string): Promise<{ message: string }> {
    const brand = await this.findOne(id);
    brand.isDeleted = true;
    await brand.save();

    return { message: 'Xóa brand thành công' };
  }

  async getActiveBrands(): Promise<BrandDocument[]> {
    return this.brandModel
      .find({ status: 'active', isDeleted: false })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async getFeaturedBrands(): Promise<BrandDocument[]> {
    return this.brandModel
      .find({ status: 'active', isDeleted: false, isFeatured: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  // Cập nhật số lượng sản phẩm trong brand
  async updateProductCount(brandId: string, increment: number): Promise<void> {
    await this.brandModel.findByIdAndUpdate(brandId, {
      $inc: { productCount: increment },
    });
  }
}
