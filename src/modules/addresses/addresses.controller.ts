import {
  Controller,
  UseGuards,
  Post,
  Req,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

// Định nghĩa Interface để hết lỗi ESLint "any"
interface RequestWithUser extends Request {
  user: { id: string };
}

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@Req() req: RequestWithUser, @Body() dto: CreateAddressDto) {
    const data = await this.addressesService.create(req.user.id, dto);
    return {
      success: true,
      message: 'Tạo địa chỉ mới thành công',
      data,
    };
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: { page?: number; limit?: number },
  ) {
    const result = await this.addressesService.findAll(req.user.id, query);

    return {
      success: true,
      message:
        result.list.length > 0
          ? 'Lấy danh sách thành công'
          : 'Danh sách địa chỉ trống',
      data: result.list,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const data = await this.addressesService.update(id, req.user.id, dto);
    return {
      success: true,
      message: 'Cập nhật địa chỉ thành công',
      data,
    };
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.addressesService.remove(id, req.user.id);
    return {
      success: true,
      message: 'Xóa địa chỉ thành công',
    };
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN) // Chỉ Admin mới vào được
  async findAllByAdmin(@Query() query: any) {
    const result = await this.addressesService.findAllAdmin(query);
    return {
      success: true,
      message: 'Admin lấy danh sách địa chỉ toàn hệ thống thành công',
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Delete('admin/:id')
  @Roles(UserRole.ADMIN)
  async removeByAdmin(@Param('id') id: string) {
    await this.addressesService.removeByAdmin(id);
    return {
      success: true,
      message: 'Admin xóa địa chỉ thành công',
    };
  }
}
