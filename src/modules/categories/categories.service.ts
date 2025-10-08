import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

export interface CreateCategoryDto {
  code: string;
  name: string;
}

export interface UpdateCategoryDto {
  code?: string;
  name?: string;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryModel
      .findOne({
        code: createCategoryDto.code,
      })
      .exec();

    if (existingCategory) {
      throw new ConflictException('Mã danh mục đã tồn tại');
    }

    const category = new this.categoryModel(createCategoryDto);
    return category.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return category;
  }

  async findByCode(code: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ code }).exec();

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    if (updateCategoryDto.code) {
      const existingCategory = await this.categoryModel
        .findOne({
          code: updateCategoryDto.code,
          _id: { $ne: id },
        })
        .exec();

      if (existingCategory) {
        throw new ConflictException('Mã danh mục đã tồn tại');
      }
    }

    const category = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return category;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }
  }
}
