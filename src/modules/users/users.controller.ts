import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: { id: string; email: string; role: string }) {
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: { id: string; email: string; role: string },
    // @Body() : UpdateUserDto,
  ) {
    return {
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
