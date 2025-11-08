import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { GoogleUser } from 'src/types/entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() request: Request) {
    return this.authService.login(loginDto, request);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user) {
        const frontendUrl = process.env.FRONTEND_URL;
        return res.redirect(
          `${frontendUrl}/auth/google/error?message=${encodeURIComponent('No user data from Google')}`,
        );
      }

      const result = await this.authService.googleLogin(req.user as GoogleUser);
      const frontendUrl = process.env.FRONTEND_URL;

      return res.redirect(
        `${frontendUrl}/auth/google/success?token=${result.accessToken}&refreshToken=${result.refreshToken}`,
      );
    } catch (error: any) {
      const frontendUrl = process.env.FRONTEND_URL;
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Unknown error';
      return res.redirect(
        `${frontendUrl}/auth/google/error?message=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: Request, @Res() res: Response) {
    const userId = (request.user as { id: string })?.id;
    const result = await this.authService.logout(userId, request);
    return res.json(result);
  }
}
