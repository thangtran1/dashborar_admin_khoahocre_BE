import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
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

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    const slug = createCategoryDto.slug || this.generateSlug(createCategoryDto.name);

    // Kiểm tra slug đã tồn tại chưa
    const existingCategory = await this.categoryModel.findOne({
      slug,
      isDeleted: false,
    });

    if (existingCategory) {
      throw new ConflictException('Category với slug này đã tồn tại');
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      slug,
    });

    return  category.save();
  }

  async findAll(query: QueryCategoryDto) {
    const {
      search,
      status,
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

    const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [data, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments(filter),
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

  async findOne(id: string): Promise<CategoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Category không tồn tại');
    }

    const category = await this.categoryModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!category) {
      throw new NotFoundException('Category không tồn tại');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOne({
      slug,
      isDeleted: false,
    });

    if (!category) {
      throw new NotFoundException('Category không tồn tại');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    const category = await this.findOne(id);

    // Nếu có cập nhật slug, kiểm tra trùng lặp
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.categoryModel.findOne({
        slug: updateCategoryDto.slug,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existingCategory) {
        throw new ConflictException('Category với slug này đã tồn tại');
      }
    }

    // Nếu cập nhật name mà không có slug, tự động tạo slug mới
    if (updateCategoryDto.name && !updateCategoryDto.slug) {
      updateCategoryDto.slug = this.generateSlug(updateCategoryDto.name);
    }

    Object.assign(category, updateCategoryDto);
    return category.save();
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);
    category.isDeleted = true;
    await category.save();

    return { message: 'Xóa category thành công' };
  }

  async getActiveCategories(): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({ status: 'active', isDeleted: false })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  // Cập nhật số lượng sản phẩm trong category
  async updateProductCount(
    categoryId: string,
    increment: number,
  ): Promise<void> {
    await this.categoryModel.findByIdAndUpdate(categoryId, {
      $inc: { productCount: increment },
    });
  }
}
