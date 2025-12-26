import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { GoogleUser } from 'src/types/entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthProvider } from '../users/schemas/user.schema';

@Injectable()
export class GoogleOAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async handleGoogleLogin(googleUser: GoogleUser) {
    if (!googleUser.email) {
      throw new BadRequestException('Email không được cung cấp từ Google');
    }

    // Kiểm tra user đã tồn tại chưa
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      // Tạo user mới với thông tin từ Google
      const tempPassword = this.generateRandomPassword();
      const registerDto: RegisterDto = {
        email: googleUser.email,
        name: googleUser.name || googleUser.email.split('@')[0],
        password: tempPassword,
        confirmPassword: tempPassword,
        role: 'user',
        providers: [AuthProvider.GOOGLE],
      };
      user = await this.usersService.create(registerDto as CreateUserDto);
    } else {
      // User đã tồn tại → thêm provider Google vào [] nếu chưa có
      if (!user.providers) user.providers = [];
      if (!user.providers.includes(AuthProvider.GOOGLE)) {
        user.providers.push(AuthProvider.GOOGLE);
        await this.usersService.update(user._id, { providers: user.providers });
      }
    }

    // Tạo JWT tokens
    const payload: JwtPayload = {
      sub: user._id as string,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return {
      success: true,
      message: 'Đăng nhập Google thành công.',
      accessToken,
      refreshToken,
      user: {
        id: user._id as string,
        email: user.email,
        username: user.name,
        avatar: googleUser.avatar || null,
        role: user.role,
      },
    };
  }

  private generateRandomPassword(): string {
    return 'google-oauth-' + Math.random().toString(36).substring(2, 15);
  }
}
