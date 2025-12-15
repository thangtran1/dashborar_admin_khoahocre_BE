import {
  Controller,
  Post,
  Delete,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  async addToWishlist(
    @Query('productId') productId: string,
    @CurrentUser() user: any,
  ) {
    if (!productId)
      throw new BadRequestException('productId query is required');

    const { wishlist, message } = await this.wishlistService.addToWishlist(
      user.id,
      productId,
    );

    return {
      success: true,
      message,
      data: wishlist,
    };
  }

  @Delete()
  async removeFromWishlist(
    @Query('productId') productId: string,
    @CurrentUser() user: any,
  ) {
    if (!productId)
      throw new BadRequestException('productId query is required');

    const result = await this.wishlistService.removeFromWishlist(
      user.id,
      productId,
    );

    return {
      success: true,
      message: result.message,
    };
  }

  @Delete('all')
  async resetWishlist(@CurrentUser() user: any) {
    const result = await this.wishlistService.resetWishlist(user.id);
    return {
      success: true,
      message: result.message,
    };
  }

  @Get()
  async getAllWishlist(@CurrentUser() user: any) {
    const products = await this.wishlistService.getAllWishlist(user.id);
    return {
      success: true,
      message: 'Get wishlist successfully!',
      data: { products },
    };
  }
}
