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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // Public: Lấy danh sách brands active
  @Get('active')
  async getActiveBrands() {
    const brands = await this.brandsService.getActiveBrands();
    if (!brands) {
      throw new NotFoundException('Không tìm thấy danh sách brands active');
    }
    return {
      success: true,
      message: 'Lấy danh sách brands active thành công',
      data: brands,
    }
  }

  // Public: Lấy danh sách brands nổi bật
  @Get('featured')
  async getFeaturedBrands() {
    const brands = await this.brandsService.getFeaturedBrands();
    if (!brands) {
      throw new NotFoundException('Không tìm thấy danh sách brands nổi bật');
    }
    return {
      success: true,
      message: 'Lấy danh sách brands nổi bật thành công',
      data: brands,
    }
  }

  // Public: Lấy brand theo slug
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
      const brand = await this.brandsService.findBySlug(slug);
    if (!brand) {
      throw new NotFoundException('Không tìm thấy brand theo slug');
    }
    return {
      success: true,
      message: 'Lấy brand theo slug thành công',
      data: brand,
    }
  }

  // Admin: Tạo brand mới
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createBrandDto: CreateBrandDto) {
    const brand = await this.brandsService.create(createBrandDto);
    if (!brand) {
      throw new NotFoundException('Không tìm thấy brand mới');
    }
    return {
      success: true,
      message: 'Tạo brand mới thành công',
      data: brand,
    }
  }

  // Admin: Lấy danh sách tất cả brands (có phân trang, filter)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(@Query() query: QueryBrandDto) {
      const brands = await this.brandsService.findAll(query);
    if (!brands) {
      throw new NotFoundException('Không tìm thấy danh sách brands');
    }
    return {
      success: true,
      message: 'Lấy danh sách brands thành công',
      data: brands,
    }
  }

  // Admin: Lấy chi tiết brand theo ID
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const brand = await this.brandsService.findOne(id);
    if (!brand) {
      throw new NotFoundException('Không tìm thấy brand theo ID');
    }
    return {
      success: true,
      message: 'Lấy brand theo ID thành công',
      data: brand,
    }
  }

  // Admin: Cập nhật brand
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandsService.update(id, updateBrandDto);
    if (!brand) {
      throw new NotFoundException('Không tìm thấy brand theo ID');
    }
    return {
      success: true,
      message: 'Cập nhật brand thành công',
      data: brand,
    }
  }

  // Admin: Xóa brand (soft delete)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    const brand = await this.brandsService.remove(id);
    if (!brand) {
      throw new NotFoundException('Không tìm thấy brand theo ID');
    }
    return {
      success: true,
      message: 'Xóa brand thành công',
    }
  }
}
