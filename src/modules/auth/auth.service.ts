import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserDocument, UserStatus } from '../users/schemas/user.schema';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { templateHtml } from 'src/templates/reset-password-form';
import { newUserNotificationTemplate } from 'src/templates/new-user-notification';
import { GoogleOAuthService } from './google-oauth.service';
import { GoogleUser } from 'src/types/entity';
import type { Request } from 'express';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private activityLogService: ActivityLogService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private googleOAuthService: GoogleOAuthService,
  ) {}

  async login(loginDto: LoginDto, request: Request) {
    const user: UserDocument | null = await this.usersService.findByEmail(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Email không tồn tại trong hệ thống.');
    }
    await this.activityLogService.createActivityLog(
      user._id as string,
      'login',
      request.ip as string,
      request.headers['user-agent'] as string,
    );

    // Kiểm tra trạng thái tài khoản
    if (user.isDeleted || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        user.isDeleted
          ? 'Tài khoản đã bị xóa. Vui lòng liên hệ quản trị viên.'
          : user.status === UserStatus.INACTIVE
            ? 'Tài khoản chưa được kích hoạt. Vui lòng liên hệ quản trị viên.'
            : 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
      );
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác.');
    }

    // Cập nhật thông tin đăng nhập
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();

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
      message: 'Đăng nhập thành công.',
      accessToken,
      refreshToken,
      user: {
        id: user._id as string,
        email: user.email,
        username: user.name,
        avatar: user.avatar || null,
        role: user.role,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user: UserDocument | null = await this.usersService.findByEmail(
      forgotPasswordDto.email,
    );

    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống.');
    }
    // Kiểm tra trạng thái tài khoản
    if (user.isDeleted || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        user.isDeleted
          ? 'Tài khoản đã bị xóa. Vui lòng liên hệ quản trị viên.'
          : user.status === UserStatus.INACTIVE
            ? 'Tài khoản chưa được kích hoạt. Vui lòng liên hệ quản trị viên.'
            : 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.updateOtp(user.email, otp, otpExpiry);

    const payload = { id: user._id as string };
    const token = this.jwtService.sign(payload, { expiresIn: 900 });

    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

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

    const payload = { id: user._id as string };
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
      await this.usersService.resetPassword(
        decoded.id,
        resetPasswordDto.newPassword,
      );

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

  async sendNewUserNotification(
    userEmail: string,
    userName: string,
    temporaryPassword: string,
    createdAt?: Date,
  ) {
    try {
      const loginUrl = `${this.configService.get<string>('FRONTEND_URL')}/login`;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.configService.get<string>('GMAIL_USER'),
          pass: this.configService.get<string>('GMAIL_PASS'),
        },
      });

      // Format created date
      const formattedCreatedAt = createdAt
        ? new Date(createdAt).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh',
          })
        : new Date().toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh',
          });

      const html = newUserNotificationTemplate(
        userName,
        userEmail,
        temporaryPassword,
        loginUrl,
        formattedCreatedAt,
      );

      const mailOptions = {
        from: this.configService.get<string>('GMAIL_USER'),
        to: userEmail,
        subject: 'Chào mừng bạn đến với hệ thống - Thông tin tài khoản mới',
        html: html,
      };

      await transporter.sendMail(mailOptions);

      return {
        success: true,
        message: 'Đã gửi email thông báo tạo tài khoản thành công.',
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      // Don't throw error to prevent user creation from failing
      return {
        success: false,
        message: 'Không thể gửi email thông báo.',
        error: (error as Error).message,
      };
    }
  }

  async logout(userId: string, request: Request) {
    await this.activityLogService.createActivityLog(
      userId,
      'logout',
      request.ip as string,
      request.headers['user-agent'] as string,
    );

    return {
      success: true,
      message: 'Đăng xuất thành công.',
    };
  }
}
