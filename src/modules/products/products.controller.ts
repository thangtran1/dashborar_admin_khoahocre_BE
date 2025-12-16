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
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateReviewDto, ReplyReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ============ PUBLIC ENDPOINTS ============

  // Lấy sản phẩm nổi bật
  @Get('featured')
  async getFeaturedProducts(@Query('limit') limit?: string) {
    const featuredProducts = await this.productsService.getFeaturedProducts(
      limit ? parseInt(limit) : 10,
    );
    if (!featuredProducts) {
      throw new NotFoundException('Không tìm thấy sản phẩm nổi bật');
    }
    return {
      success: true,
      message: 'Lấy sản phẩm nổi bật thành công',
      data: featuredProducts,
    };
  }

  // Lấy sản phẩm mới
  @Get('new')
  async getNewProducts(@Query('limit') limit?: string) {
    const newProducts = await this.productsService.getNewProducts(
      limit ? parseInt(limit) : 10,
    );
    if (!newProducts || newProducts.length === 0) {
      throw new NotFoundException('Không tìm thấy sản phẩm mới');
    }
    return {
      success: true,
      message: 'Lấy sản phẩm mới thành công',
      data: newProducts,
    };
  }

  // Lấy sản phẩm bán chạy
  @Get('best-sellers')
  async getBestSellers(@Query('limit') limit?: string) {
    const bestSellers = await this.productsService.getBestSellers(
      limit ? parseInt(limit) : 10,
    );
    if (!bestSellers || bestSellers.length === 0) {
      throw new NotFoundException('Không tìm thấy sản phẩm bán chạy');
    }
    return {
      success: true,
      message: 'Lấy sản phẩm bán chạy thành công',
      data: bestSellers,
    };
  }

  // Lấy sản phẩm deal
  @Get('deals')
  async getDealProducts(@Query('limit') limit?: string) {
    const dealProducts = await this.productsService.getDealProducts(
      limit ? parseInt(limit) : 10,
    );
    if (!dealProducts || dealProducts.length === 0) {
      throw new NotFoundException('Không tìm thấy sản phẩm deal');
    }
    return {
      success: true,
      message: 'Lấy sản phẩm deal thành công',
      data: dealProducts,
    };
  }

  // Lấy product theo slug (Public)
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm theo slug');
    }
    return {
      success: true,
      message: 'Lấy sản phẩm theo slug thành công',
      data: product,
    };
  }

  // Lấy sản phẩm theo category slug
  @Get('category/:categorySlug')
  async getProductsByCategory(
    @Param('categorySlug') categorySlug: string,
    @Query() query: QueryProductDto,
  ) {
    const products = await this.productsService.getProductsByCategory(
      categorySlug,
      query,
    );
    if (!products) {
      throw new NotFoundException('Không tìm thấy sản phẩm theo category');
    }
    return {
      success: true,
      message: 'Lấy sản phẩm theo category thành công',
      data: products,
    };
  }

  // Lấy sản phẩm theo brand slug
  @Get('brand/:brandSlug')
  async getProductsByBrand(
    @Param('brandSlug') brandSlug: string,
    @Query() query: QueryProductDto,
  ) {
    const products = await this.productsService.getProductsByBrand(
      brandSlug,
      query,
    );
    if (!products) {
      throw new NotFoundException('Không tìm thấy sản phẩm theo brand');
    }
    return {
      success: true,
      message: 'Lấy sản phẩm theo brand thành công',
      data: products,
    };
  }

  // Lấy sản phẩm liên quan
  @Get(':id/related')
  async getRelatedProducts(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const products = await this.productsService.getRelatedProducts(
      id,
      limit ? parseInt(limit) : 6,
    );
    if (!products) {
      throw new NotFoundException('Không tìm thấy sản phẩm liên quan');
    }
    return {
      success: true,
      message: 'Lấy sản phẩm liên quan thành công',
      data: products,
    };
  }

  // ============ ADMIN ENDPOINTS ============

  // Tạo product mới
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm mới');
    }
    return {
      success: true,
      message: 'Tạo sản phẩm mới thành công',
      data: product,
    };
  }

  // Lấy danh sách products (Admin - có phân trang, filter)
  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async findAll(@Query() query: QueryProductDto) {
    const products = await this.productsService.findAll(query);
    if (!products) {
      throw new NotFoundException('Không tìm thấy danh sách sản phẩm');
    }
    return {
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: products,
    };
  }

  // Lấy chi tiết product theo ID
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm theo ID');
    }
    return {
      success: true,
      message: 'Lấy sản phẩm theo ID thành công',
      data: product,
    };
  }

  // Cập nhật product
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(id, updateProductDto);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm theo ID');
    }
    return {
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: product,
    };
  }

  // Xóa product (soft delete)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    const product = await this.productsService.remove(id);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm theo ID');
    }
    return {
      success: true,
      message: 'Xóa sản phẩm thành công',
    };
  }

  // ============ REVIEW ENDPOINTS ============

  // Thêm review (User đã đăng nhập)
  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  async addReview(
    @Param('id') productId: string,
    @Req() request: Request & { user: { id: string } },
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const user = request.user;
    const product = await this.productsService.addReview(
      productId,
      user.id,
      false, // TODO: check if purchased
      createReviewDto,
    );

    return {
      success: true,
      message: 'Thêm review thành công',
      data: product,
    };
  }

  // Reply review
  @Post(':productId/reviews/:reviewId/reply')
  @UseGuards(JwtAuthGuard)
  async replyToReview(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string,
    @Req()
    request: Request & {
      user: {
        id: string;
        name: string;
        avatar: string | undefined;
        role: string;
      };
    },
    @Body() replyDto: ReplyReviewDto,
  ) {
    const user = request.user;
    const isAdmin = user.role === 'admin';
    const review = await this.productsService.replyToReview(
      productId,
      reviewId,
      user.id,
      user.name,
      isAdmin,
      replyDto,
    );
    if (!review) {
      throw new NotFoundException('Không tìm thấy review');
    }
    return {
      success: true,
      message: 'Phản hồi review thành công',
      data: review,
    };
  }

  // Delete review (Admin only)
  @Delete(':productId/reviews/:reviewId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteReview(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string,
  ) {
    const review = await this.productsService.deleteReview(productId, reviewId);
    if (!review) {
      throw new NotFoundException('Không tìm thấy review');
    }
    return {
      success: true,
      message: 'Xóa review thành công',
      data: review,
    };
  }
}
