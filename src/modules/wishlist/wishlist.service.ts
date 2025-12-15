import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name)
    private wishlistModel: Model<WishlistDocument>,
    private readonly productsService: ProductsService,
  ) {}

  // Thêm sản phẩm vào wishlist
  async addToWishlist(userId: string, productId: string) {
    if (!isValidObjectId(productId)) {
      throw new BadRequestException('productId không hợp lệ');
    }

    let wishlist = await this.wishlistModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!wishlist) {
      // Tạo mới wishlist
      wishlist = await this.wishlistModel.create({
        userId: new Types.ObjectId(userId),
        products: [new Types.ObjectId(productId)],
      });
      return { wishlist, message: 'Product added successfully!' };
    }

    // Kiểm tra xem sản phẩm đã tồn tại chưa
    if (wishlist.products.some((p) => p.toString() === productId)) {
      return { wishlist, message: 'Product already in wishlist' };
    }

    wishlist.products.push(new Types.ObjectId(productId));
    await wishlist.save();
    return { wishlist, message: 'Product added successfully!' };
  }

  // Xóa sản phẩm khỏi wishlist
  async removeFromWishlist(userId: string, productId: string) {
    if (!isValidObjectId(productId)) {
      throw new BadRequestException('productId không hợp lệ');
    }

    const wishlist = await this.wishlistModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!wishlist) throw new NotFoundException('Wishlist không tồn tại');

    // Kiểm tra sản phẩm có tồn tại trong wishlist không
    if (!wishlist.products.some((p) => p.toString() === productId)) {
      throw new NotFoundException('Product not in wishlist');
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId,
    );

    if (wishlist.products.length === 0) {
      await this.wishlistModel.deleteOne({
        userId: new Types.ObjectId(userId),
      });
      return {
        products: [],
        message: 'Product removed, wishlist is now empty',
      };
    }

    await wishlist.save();
    return {
      products: wishlist.products,
      message: 'Product removed successfully',
    };
  }

  // Reset toàn bộ wishlist
  async resetWishlist(userId: string) {
    const result = await this.wishlistModel.deleteOne({
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Wishlist không tồn tại');
    }

    return { message: 'Wishlist reset successfully' };
  }

  // Lấy tất cả sản phẩm trong wishlist
  async getAllWishlist(userId: string) {
    // Lấy wishlist và populate products, brand, category
    const wishlist = await this.wishlistModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'products',
        select: 'name price discount image slug brand category',
        populate: [
          { path: 'brand', select: 'name logo' },
          { path: 'category', select: 'name logo' },
        ],
      });

    if (!wishlist) return [];

    // Chuyển từng product sang plain object và bật virtuals
    const products = wishlist.products.map((product: any) =>
      product.toObject({ virtuals: true }),
    );

    return products;
  }
}
