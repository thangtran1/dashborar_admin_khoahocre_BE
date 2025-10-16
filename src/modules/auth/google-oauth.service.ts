import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { GoogleUser } from 'src/types/entity';

@Injectable()
export class GoogleOAuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
      };

      user = await this.usersService.create(registerDto);
    }

    // Tạo JWT tokens
    const payload: JwtPayload = {
      sub: user._id.toString(),
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
        id: user._id.toString(),
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
