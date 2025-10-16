import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { templateHtml } from 'src/templates/reset-password-form';
import { GoogleOAuthService } from './google-oauth.service';
import { GoogleUser } from 'src/types/entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private googleOAuthService: GoogleOAuthService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user: UserDocument = await this.usersService.create(registerDto);

    return {
      message: 'Đăng ký thành công.',
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user: UserDocument | null = await this.usersService.findByEmail(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Email không tồn tại.');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác.');
    }

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
      message: 'Đăng nhập thành công.',
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.name,
        avatar: null,
        role: user.role,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user: UserDocument | null = await this.usersService.findByEmail(
      forgotPasswordDto.email,
    );

    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.updateOtp(user.email, otp, otpExpiry);

    const payload = { id: user._id.toString() };
    const token = this.jwtService.sign(payload, { expiresIn: 900 });

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_PASS'),
      },
    });

    const html = templateHtml(resetLink, otp);

    const mailOptions = {
      from: this.configService.get<string>('GMAIL_USER'),
      to: forgotPasswordDto.email,
      subject: 'Đặt lại mật khẩu',
      html: html,
    };

    try {
      await transporter.sendMail(mailOptions);
      return {
        success: true,
        message: 'Đã gửi email đặt lại mật khẩu.',
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        message: 'Không thể gửi email, nhưng đã tạo OTP và link reset.',
        otp: otp,
        resetLink: resetLink,
      };
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user: UserDocument | null = await this.usersService.findByEmail(
      verifyOtpDto.email,
    );

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại.');
    }

    if (new Date() > user.otpExpiry!) {
      throw new BadRequestException('OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    }

    if (user.otp !== verifyOtpDto.otp) {
      throw new BadRequestException(
        'Mã OTP không đúng. Vui lòng kiểm tra lại.',
      );
    }

    const payload = { id: user._id.toString() };
    const token = this.jwtService.sign(payload, { expiresIn: 900 });

    return {
      success: true,
      token,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const decoded: { id: string } = this.jwtService.verify(
        resetPasswordDto.token,
      );
      await this.usersService.updatePassword(decoded.id, {
        currentPassword: resetPasswordDto.currentPassword,
        newPassword: resetPasswordDto.newPassword,
      });

      return {
        success: true,
        message: 'Đổi mật khẩu thành công.',
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
    }
  }

  async googleLogin(googleUser: GoogleUser) {
    return this.googleOAuthService.handleGoogleLogin(googleUser);
  }

  logout() {
    return {
      success: true,
      message: 'Đăng xuất thành công.',
    };
  }
}
