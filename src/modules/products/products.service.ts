import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateReviewDto, ReplyReviewDto } from './dto/create-review.dto';
import { CategoriesService } from '../categories/categories.service';
import { BrandsService } from '../brands/brands.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    private categoriesService: CategoriesService,
    private brandsService: BrandsService,
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

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    // Kiểm tra Category tồn tại
    await this.categoriesService.findOne(createProductDto.category);

    // Kiểm tra Brand tồn tại
    await this.brandsService.findOne(createProductDto.brand);

    const slug =
      createProductDto.slug || this.generateSlug(createProductDto.name);

    // Kiểm tra slug đã tồn tại chưa
    const existingProduct = await this.productModel.findOne({
      slug,
      isDeleted: false,
    });

    if (existingProduct) {
      throw new ConflictException('Product với slug này đã tồn tại');
    }

    // Kiểm tra SKU nếu có
    if (createProductDto.sku) {
      const existingSku = await this.productModel.findOne({
        sku: createProductDto.sku,
        isDeleted: false,
      });

      if (existingSku) {
        throw new ConflictException('SKU này đã tồn tại');
      }
    }

    const product = new this.productModel({
      ...createProductDto,
      slug,
      category: new Types.ObjectId(createProductDto.category),
      brand: new Types.ObjectId(createProductDto.brand),
    });

    const savedProduct = await product.save();

    // Cập nhật số lượng sản phẩm trong Category và Brand
    await Promise.all([
      this.categoriesService.updateProductCount(createProductDto.category, 1),
      this.brandsService.updateProductCount(createProductDto.brand, 1),
    ]);

    return savedProduct;
  }

  async findAll(query: QueryProductDto) {
    const {
      search,
      category,
      brand,
      status,
      isNew,
      isFeatured,
      isBestSeller,
      minPrice,
      maxPrice,
      minDiscount,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = { isDeleted: false };

    // Tìm kiếm theo text
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Filter theo category
    if (category) {
      filter.category = new Types.ObjectId(category);
    }

    // Filter theo brand
    if (brand) {
      filter.brand = new Types.ObjectId(brand);
    }

    // Filter theo status
    if (status) {
      filter.status = status;
    }

    // Filter theo flags
    if (isNew !== undefined) {
      filter.isNew = isNew;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    if (isBestSeller !== undefined) {
      filter.isBestSeller = isBestSeller;
    }

    // Filter theo giá
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;
      }
    }

    // Filter theo discount
    if (minDiscount !== undefined) {
      filter.discount = { $gte: minDiscount };
    }

    const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category', 'name slug')
        .populate('brand', 'name slug logo')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
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

  async findOne(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Product không tồn tại');
    }

    const product = await this.productModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .populate('category', 'name slug description')
      .populate('brand', 'name slug logo description');

    if (!product) {
      throw new NotFoundException('Product không tồn tại');
    }

    return product;
  }

  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findOne({
        slug,
        isDeleted: false,
      })
      .populate('category', 'name slug description')
      .populate('brand', 'name slug logo description');

    if (!product) {
      throw new NotFoundException('Product không tồn tại');
    }

    // Tăng view count
    await this.productModel.findByIdAndUpdate(product._id, {
      $inc: { viewCount: 1 },
    });

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const product = await this.findOne(id);
    const oldCategoryId = product.category.toString();
    const oldBrandId = product.brand.toString();

    // Nếu có cập nhật category, kiểm tra tồn tại
    if (updateProductDto.category) {
      await this.categoriesService.findOne(updateProductDto.category);
    }

    // Nếu có cập nhật brand, kiểm tra tồn tại
    if (updateProductDto.brand) {
      await this.brandsService.findOne(updateProductDto.brand);
    }

    // Nếu có cập nhật slug, kiểm tra trùng lặp
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existingProduct = await this.productModel.findOne({
        slug: updateProductDto.slug,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existingProduct) {
        throw new ConflictException('Product với slug này đã tồn tại');
      }
    }

    // Nếu có cập nhật SKU, kiểm tra trùng lặp
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productModel.findOne({
        sku: updateProductDto.sku,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existingSku) {
        throw new ConflictException('SKU này đã tồn tại');
      }
    }

    // Nếu cập nhật name mà không có slug, tự động tạo slug mới
    if (updateProductDto.name && !updateProductDto.slug) {
      updateProductDto.slug = this.generateSlug(updateProductDto.name);
    }

    // Cập nhật product
    Object.assign(product, {
      ...updateProductDto,
      category: updateProductDto.category
        ? new Types.ObjectId(updateProductDto.category)
        : product.category,
      brand: updateProductDto.brand
        ? new Types.ObjectId(updateProductDto.brand)
        : product.brand,
    });

    const savedProduct = await product.save();

    // Cập nhật product count nếu thay đổi category
    if (updateProductDto.category && updateProductDto.category !== oldCategoryId) {
      await Promise.all([
        this.categoriesService.updateProductCount(oldCategoryId, -1),
        this.categoriesService.updateProductCount(updateProductDto.category, 1),
      ]);
    }

    // Cập nhật product count nếu thay đổi brand
    if (updateProductDto.brand && updateProductDto.brand !== oldBrandId) {
      await Promise.all([
        this.brandsService.updateProductCount(oldBrandId, -1),
        this.brandsService.updateProductCount(updateProductDto.brand, 1),
      ]);
    }

    return savedProduct;
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.findOne(id);
    product.isDeleted = true;
    await product.save();

    // Giảm product count trong category và brand
    await Promise.all([
      this.categoriesService.updateProductCount(
        product.category._id?.toString() ?? product.category.toString(),
        -1,
      ),
      this.brandsService.updateProductCount(
        product.brand._id?.toString() ?? product.brand.toString(),
        -1,
      ),
    ]);

    return { message: 'Xóa product thành công' };
  }

  // ============ SPECIAL QUERIES ============

  async getFeaturedProducts(limit: number = 10): Promise<ProductDocument[]> {
    return this.productModel
      .find({ status: 'active', isDeleted: false, isFeatured: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getNewProducts(limit: number = 10): Promise<ProductDocument[]> {
    return this.productModel
      .find({ status: 'active', isDeleted: false, isNew: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getBestSellers(limit: number = 10): Promise<ProductDocument[]> {
    return this.productModel
      .find({ status: 'active', isDeleted: false, isBestSeller: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .sort({ soldCount: -1 })
      .limit(limit)
      .exec();
  }

  async getDealProducts(limit: number = 10): Promise<ProductDocument[]> {
    return this.productModel
      .find({
        status: 'active',
        isDeleted: false,
        discount: { $gt: 10 },
      })
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .sort({ discount: -1 })
      .limit(limit)
      .exec();
  }

  async getProductsByCategory(
    categorySlug: string,
    query: QueryProductDto,
  ): Promise<any> {
    const category = await this.categoriesService.findBySlug(categorySlug);
    return this.findAll({ ...query, category: category._id.toString() });
  }

  async getProductsByBrand(
    brandSlug: string,
    query: QueryProductDto,
  ): Promise<any> {
    const brand = await this.brandsService.findBySlug(brandSlug);
    return this.findAll({ ...query, brand: brand._id.toString() });
  }

  async getRelatedProducts(
    productId: string,
    limit: number = 6,
  ): Promise<ProductDocument[]> {
    const product = await this.findOne(productId);

    return this.productModel
      .find({
        status: 'active',
        isDeleted: false,
        _id: { $ne: productId },
        $or: [ { category: product.category._id || product.category },
          { brand: product.brand._id || product.brand }],
      })
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .limit(limit)
      .exec();
  }

  // ============ REVIEWS ============

  async addReview(
    productId: string,
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    hasPurchased: boolean,
    createReviewDto: CreateReviewDto,
  ): Promise<ProductDocument> {
    const product = await this.findOne(productId);

    const review = {
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      user: new Types.ObjectId(userId),
      userName,
      userAvatar,
      type: hasPurchased ? 'Đã mua hàng' : 'Chưa mua hàng',
      images: createReviewDto.images || [],
      replies: [],
      isApproved: false,
    };

    product.reviews.push(review as any);
    product.reviewCount = product.reviews.length;

    // Tính average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.averageRating = Math.round((totalRating / product.reviews.length) * 10) / 10;

    return product.save();
  }

  async replyToReview(
    productId: string,
    reviewId: string,
    userId: string,
    userName: string,
    isAdmin: boolean,
    replyDto: ReplyReviewDto,
  ): Promise<ProductDocument> {
    // Sử dụng $push operator để đảm bảo push vào array đúng cách
    const product = await this.productModel.findOneAndUpdate(
      {
        _id: productId,
        isDeleted: false,
        'reviews._id': reviewId,
      },
      {
        $push: {
          'reviews.$.replies': {
            _id: new Types.ObjectId(),
            comment: replyDto.comment,
            user: new Types.ObjectId(userId),
            userName,
            isAdmin,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!product) {
      throw new NotFoundException('Review không tồn tại');
    }

    return product;
  }

  async approveReview(
    productId: string,
    reviewId: string,
  ): Promise<ProductDocument> {
    const product = await this.productModel.findOneAndUpdate(
      {
        _id: productId,
        isDeleted: false,
        'reviews._id': reviewId,
      },
      {
        $set: { 'reviews.$.isApproved': true },
      },
      { new: true },
    );

    if (!product) {
      throw new NotFoundException('Review không tồn tại');
    }

    return product;
  }

  async deleteReview(
    productId: string,
    reviewId: string,
  ): Promise<ProductDocument> {
    const product = await this.productModel.findOneAndUpdate(
      {
        _id: productId,
        isDeleted: false,
      },
      {
        $pull: { reviews: { _id: reviewId } },
      },
      { new: true },
    );

    if (!product) {
      throw new NotFoundException('Product không tồn tại');
    }

    // Cập nhật lại reviewCount và averageRating
    product.reviewCount = product.reviews.length;
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
      product.averageRating =
        Math.round((totalRating / product.reviews.length) * 10) / 10;
    } else {
      product.averageRating = 0;
    }

    return product.save();
  }
}
