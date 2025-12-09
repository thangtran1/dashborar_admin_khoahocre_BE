import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Public: Lấy danh sách categories active
  @Get('active')
  async getActiveCategories() {
    const category = await this.categoriesService.getActiveCategories();
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh sách categories active');
    }
    return {
      success: true,
      message: 'Lấy danh sách categories active thành công',
      data: category,
    };
  }

  // Public: Lấy category theo slug
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    if (!category) {
      throw new NotFoundException('Không tìm thấy category theo slug');
    }
    return {
      success: true,
      message: 'Lấy category theo slug thành công',
      data: category,
    };
  }

  // Admin: Tạo category mới
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);

    return {
      success: true,
      message: 'Tạo category thành công',
      data: category,
    };
  }

  // Admin: Lấy danh sách tất cả categories (có phân trang, filter)
  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async findAll(@Query() query: QueryCategoryDto) {
    const categories = await this.categoriesService.findAll(query);
    if (!categories) {
      throw new NotFoundException('Không tìm thấy danh sách categories');
    }
    return {
      success: true,
      message: 'Lấy danh sách categories thành công',
      data: categories,
    };
  }

  // Admin: Lấy chi tiết category theo ID
  @Get(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    if (!category) {
      throw new NotFoundException('Không tìm thấy category theo ID');
    }
    return {
      success: true,
      message: 'Lấy category theo ID thành công',
      data: category,
    };
  }

  // Admin: Cập nhật category
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    if (!category) {
      throw new NotFoundException('Không tìm thấy category theo ID');
    }
    return {
      success: true,
      message: 'Cập nhật category thành công',
      data: category,
    };
  }

  // Admin: Xóa category (soft delete)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    const category = await this.categoriesService.remove(id);
    if (!category) {
      throw new NotFoundException('Không tìm thấy category theo ID');
    }
    return {
      success: true,
      message: 'Xóa category thành công',
    };
  }
}
