import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthProvider } from '../users/schemas/user.schema';

@Injectable()
export class GitHubOAuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async handleGitHubLogin(code: string) {
    // 1️⃣ Lấy access token từ GitHub
    const tokenResponse = await this.getAccessTokenFromCode(code);
    if (!(tokenResponse as { access_token: string }).access_token) {
      throw new BadRequestException('Không thể lấy access token từ GitHub');
    }

    // 2️⃣ Lấy thông tin user từ GitHub
    const githubUser = await this.getGitHubUser(
      (tokenResponse as { access_token: string }).access_token,
    );

    if (!(githubUser as { email: string }).email) {
      throw new BadRequestException('Email không được cung cấp từ GitHub');
    }

    // 3️⃣ Kiểm tra user đã tồn tại chưa
    let user = await this.usersService.findByEmail(
      (githubUser as { email: string }).email,
    );
    if (!user) {
      // Tạo user mới
      const tempPassword = this.generateRandomPassword();
      const registerDto: RegisterDto = {
        email: githubUser.email,
        name:
          githubUser.name || githubUser.login || githubUser.email.split('@')[0],
        password: tempPassword,
        confirmPassword: tempPassword,
        role: 'user', // Thêm role mặc định
        providers: [AuthProvider.GITHUB], // Thêm providers để biết đăng nhập bằng phương thức nào
      };
      user = await this.usersService.create(registerDto as CreateUserDto);
    } else {
      // User đã tồn tại → thêm provider GitHub vào [] nếu chưa có
      if (!user.providers) user.providers = [];
      if (!user.providers.includes(AuthProvider.GITHUB)) {
        user.providers.push(AuthProvider.GITHUB);
        await this.usersService.update(user._id, { providers: user.providers });
      }
    }

    // 4️⃣ Tạo JWT token
    const payload: JwtPayload = {
      sub: user._id as string,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      success: true,
      message: 'Đăng nhập GitHub thành công.',
      access_token,
      refresh_token,
      user: {
        _id: user._id as string,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  private async getAccessTokenFromCode(code: string) {
    try {
      const response = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: this.configService.get<string>('GITHUB_CLIENT_ID'),
            client_secret: this.configService.get<string>(
              'GITHUB_CLIENT_SECRET',
            ),
            code,
            redirect_uri: this.configService.get<string>('GITHUB_CALLBACK_URL'),
          }),
        },
      );

      const data = (await response.json()) as {
        error?: string;
        error_description?: string;
      };

      if (data.error) {
        throw new BadRequestException(
          data.error_description || 'Lỗi khi lấy access token từ GitHub',
        );
      }

      return data as { access_token: string };
    } catch (error) {
      console.error('GitHub OAuth Error:', error);
      throw new BadRequestException('Không thể lấy access token từ GitHub');
    }
  }

  private async getGitHubUser(accessToken: string) {
    // Lấy thông tin cơ bản
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Lỗi khi lấy thông tin user từ GitHub');
    }

    const responseData = (await response.json()) as {
      email: string;
      name: string;
      login: string;
      id: string;
    };

    // Lấy email chính
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!emailResponse.ok) {
      throw new BadRequestException('Lỗi khi lấy email từ GitHub');
    }

    const emailResponseData = (await emailResponse.json()) as {
      email: string;
      primary: boolean;
      verified: boolean;
    }[];
    const primaryEmail = emailResponseData.find(
      (email: { primary: boolean; verified: boolean }) =>
        email.primary && email.verified,
    )?.email;

    return {
      ...responseData,
      email: primaryEmail || responseData.email,
    };
  }

  private generateRandomPassword(): string {
    // return 'github-oauth-' + Math.random().toString(36).substring(2, 15); Random password
    return 'Pass123@';
  }
}
