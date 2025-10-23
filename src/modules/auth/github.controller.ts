import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GitHubOAuthService } from './github-oauth.service';
import type { Response } from 'express';

@Controller('auth/github')
export class GitHubController {
  constructor(
    private readonly githubOAuthService: GitHubOAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  githubAuth(@Res() response: Response) {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GITHUB_CALLBACK_URL');

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;

    return response.redirect(githubAuthUrl);
  }

  @Get('callback')
  async githubAuthCallback(
    @Query('code') code: string,
    @Res() response: Response,
  ) {
    try {
      const result = await this.githubOAuthService.handleGitHubLogin(code);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      // Redirect về frontend với token và thông tin user
      const params = new URLSearchParams({
        token: result.access_token,
        refreshToken: result.refresh_token,
        userId: result.user._id,
        email: result.user.email,
        username: result.user.name,
        role: result.user.role,
      });

      // Log để debug
      console.log(
        'Redirecting to:',
        `${frontendUrl}/auth/github/success?${params.toString()}`,
      );

      return response.redirect(
        `${frontendUrl}/auth/github/success?${params.toString()}`,
      );
    } catch (error: unknown) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return response.redirect(
        `${frontendUrl}/auth/github/error?error=${encodeURIComponent(
          (error as Error).message,
        )}`,
      );
    }
  }
}
