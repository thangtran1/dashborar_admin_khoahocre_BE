// import {
//   Injectable,
//   UnauthorizedException,
//   BadRequestException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import { UsersService } from '../users/users.service';
// import { UserDocument } from '../users/schemas/user.schema';
// import { RegisterDto } from './dto/register.dto';
// import { ForgotPasswordDto } from './dto/forgot-password.dto';
// import { VerifyOtpDto } from './dto/verify-otp.dto';
// import { ResetPasswordDto } from './dto/reset-password.dto';
// import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
// import * as nodemailer from 'nodemailer';
// import { LoginDto } from './dto/login.dto';
// import { PermissionType } from 'src/common/utils/enum';
// import { templateHtml } from 'src/templates/reset-password-form';

// @Injectable()
// export class AuthService {
//   constructor(
//     private usersService: UsersService,
//     private jwtService: JwtService,
//     private configService: ConfigService,
//   ) {}

//   async register(registerDto: RegisterDto) {
//     const user: UserDocument = await this.usersService.create(registerDto);

//     return {
//       message: 'Đăng ký thành công.',
//       success: true,
//       user: {
//         id: user._id.toString(),
//         email: user.email,
//         name: user.name,
//         role: user.role,
//       },
//     };
//   }

//   async login(loginDto: LoginDto) {
//     const user: UserDocument | null = await this.usersService.findByEmail(
//       loginDto.email,
//     );

//     if (!user) {
//       throw new UnauthorizedException('Email không tồn tại.');
//     }

//     const isPasswordValid = await this.usersService.validatePassword(
//       loginDto.password,
//       user.password,
//     );

//     if (!isPasswordValid) {
//       throw new UnauthorizedException('Mật khẩu không chính xác.');
//     }

//     const payload: JwtPayload = {
//       sub: user._id.toString(),
//       email: user.email,
//       role: user.role,
//     };

//     const accessToken = this.jwtService.sign(payload, {
//       expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
//     });

//     const refreshToken = this.jwtService.sign(payload, {
//       expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
//     });

//     const permission = [
//       {
//         id: '9100714781927703',
//         parentId: '',
//         label: 'sys.menu.dashboard',
//         name: 'Dashboard',
//         icon: 'local:ic-analysis',
//         type: PermissionType.CATALOGUE,
//         route: 'dashboard',
//         order: 1,
//         children: [
//           {
//             id: '8426999229400979',
//             parentId: '9100714781927703',
//             label: 'sys.menu.workbench',
//             name: 'Workbench',
//             type: PermissionType.MENU,
//             route: 'workbench',
//             component: '/dashboard/workbench/index.tsx',
//           },
//           {
//             id: '9710971640510357',
//             parentId: '9100714781927703',
//             label: 'sys.menu.analysis',
//             name: 'Analysis',
//             type: PermissionType.MENU,
//             route: 'analysis',
//             component: '/dashboard/analysis/index.tsx',
//           },
//         ],
//       },
//       {
//         id: '0901673425580518',
//         parentId: '',
//         label: 'sys.menu.management',
//         name: 'Management',
//         icon: 'local:ic-management',
//         type: PermissionType.CATALOGUE,
//         route: 'management',
//         order: 2,
//         children: [
//           {
//             id: '2781684678535711',
//             parentId: '0901673425580518',
//             label: 'sys.menu.user.index',
//             name: 'User',
//             type: PermissionType.CATALOGUE,
//             route: 'user',
//             children: [
//               {
//                 id: '2516598794787938',
//                 parentId: '2781684678535711',
//                 label: 'sys.menu.user.profile',
//                 name: 'Profile',
//                 type: PermissionType.MENU,
//                 route: 'profile',
//                 component: '/management/user/profile/index.tsx',
//               },
//             ],
//           },
//           {
//             id: '0249937641030250',
//             parentId: '0901673425580518',
//             label: 'sys.menu.system.index',
//             name: 'System',
//             type: PermissionType.CATALOGUE,
//             route: 'system',
//             children: [
//               {
//                 id: '1289241785490759',
//                 parentId: '0249937641030250',
//                 label: 'Quản lý khóa học',
//                 name: 'management-courses',
//                 type: PermissionType.MENU,
//                 route: 'management-courses',
//                 component: '/management/system/management-courses/index.tsx',
//               },

//               {
//                 id: '0177880245365434',
//                 parentId: '0249937641030250',
//                 label: 'Tạo bài viết',
//                 name: 'Tạo bài viết',
//                 type: PermissionType.MENU,
//                 route: 'created-courses',
//                 component: '/management/system/created-courses/index.tsx',
//               },
//               {
//                 id: '0157880245365434',
//                 parentId: '0249937641030250',
//                 label: 'sys.menu.system.user_detail',
//                 name: 'User Detail',
//                 type: PermissionType.MENU,
//                 route: 'created-courses',
//                 component: '/management/system/created-courses/index.tsx',
//                 hide: true,
//               },

//               {
//                 id: '0157880245365433',
//                 parentId: '0249937641030250',
//                 label: 'sys.menu.system.user',
//                 name: 'User',
//                 type: PermissionType.MENU,
//                 route: 'user',
//                 component: '/management/system/user/index.tsx',
//               },
//               {
//                 id: '0157880245365434',
//                 parentId: '0249937641030250',
//                 label: 'Danh mục',
//                 name: 'category',
//                 type: PermissionType.MENU,
//                 route: 'category',
//                 component: '/management/system/category/index.tsx',
//               },

//               {
//                 id: '1289248785490759',
//                 parentId: '0249937641030250',
//                 label: 'Danh sách giảng viên',
//                 name: 'teacher',
//                 type: PermissionType.MENU,
//                 route: 'teacher',
//                 component: '/management/system/teacher/index.tsx',
//               },
//             ],
//           },
//         ],
//       },
//       {
//         id: '2271615060673773',
//         parentId: '',
//         label: 'sys.menu.components',
//         name: 'Components',
//         icon: 'solar:widget-5-bold-duotone',
//         type: PermissionType.CATALOGUE,
//         route: 'components',
//         order: 3,
//         children: [
//           {
//             id: '2501920741714350',
//             parentId: '2271615060673773',
//             label: 'sys.menu.i18n',
//             name: 'Multi Language',
//             type: PermissionType.MENU,
//             route: 'i18n',
//             component: '/components/multi-language/index.tsx',
//           },
//           {
//             id: '7749726274771764',
//             parentId: '2271615060673773',
//             label: 'sys.menu.chart',
//             name: 'Chart',
//             type: PermissionType.MENU,
//             route: 'chart',
//             component: '/components/chart/index.tsx',
//           },
//         ],
//       },

//       {
//         id: '2271615060673777',
//         parentId: '',
//         label: 'sys.menu.chat',
//         name: 'Chat',
//         icon: 'solar:widget-5-bold-duotone',
//         type: PermissionType.CATALOGUE,
//         route: 'chat',
//         order: 7,
//         children: [
//           {
//             id: '2501920741714359',
//             parentId: '2271615060673777',
//             label: 'sys.menu.managerChatUser',
//             name: 'Manager Chat User',
//             type: PermissionType.MENU,
//             route: 'manager-chat-user',
//             component: '/chat/manager-chat-user/index.tsx',
//           },
//         ],
//       },

//       {
//         id: '0194818428516575',
//         parentId: '',
//         label: 'sys.menu.menulevel.index',
//         name: 'Menu Level',
//         icon: 'local:ic-menulevel',
//         type: PermissionType.CATALOGUE,
//         route: 'menu-level',
//         order: 5,
//         children: [
//           {
//             id: '0144431332471389',
//             parentId: '0194818428516575',
//             label: 'sys.menu.menulevel.1a',
//             name: 'Menu Level 1a',
//             type: PermissionType.MENU,
//             route: 'menu-level-1a',
//             component: '/menu-level/menu-level-1a/index.tsx',
//           },
//           {
//             id: '7572529636800586',
//             parentId: '0194818428516575',
//             label: 'sys.menu.menulevel.1b.index',
//             name: 'Menu Level 1b',
//             type: PermissionType.CATALOGUE,
//             route: 'menu-level-1b',
//             children: [
//               {
//                 id: '3653745576583237',
//                 parentId: '7572529636800586',
//                 label: 'sys.menu.menulevel.1b.2a',
//                 name: 'Menu Level 2a',
//                 type: PermissionType.MENU,
//                 route: 'menu-level-2a',
//                 component: '/menu-level/menu-level-1b/menu-level-2a/index.tsx',
//               },
//               {
//                 id: '4873136353891364',
//                 parentId: '7572529636800586',
//                 label: 'sys.menu.menulevel.1b.2b.index',
//                 name: 'Menu Level 2b',
//                 type: PermissionType.CATALOGUE,
//                 route: 'menu-level-2b',
//                 children: [
//                   {
//                     id: '4233029726998055',
//                     parentId: '4873136353891364',
//                     label: 'sys.menu.menulevel.1b.2b.3a',
//                     name: 'Menu Level 3a',
//                     type: PermissionType.MENU,
//                     route: 'menu-level-3a',
//                     component:
//                       '/menu-level/menu-level-1b/menu-level-2b/menu-level-3a/index.tsx',
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//       {
//         id: '9406067785553476',
//         parentId: '',
//         label: 'sys.menu.error.index',
//         name: 'Error',
//         icon: 'bxs:error-alt',
//         type: PermissionType.CATALOGUE,
//         route: 'error',
//         order: 6,
//         children: [
//           {
//             id: '8557056851997154',
//             parentId: '9406067785553476',
//             label: 'sys.menu.error.403',
//             name: '403',
//             type: PermissionType.MENU,
//             route: '403',
//             component: '/sys/error/Page403.tsx',
//           },
//           {
//             id: '5095669208159005',
//             parentId: '9406067785553476',
//             label: 'sys.menu.error.404',
//             name: '404',
//             type: PermissionType.MENU,
//             route: '404',
//             component: '/sys/error/Page404.tsx',
//           },
//           {
//             id: '0225992135973772',
//             parentId: '9406067785553476',
//             label: 'sys.menu.error.500',
//             name: '500',
//             type: PermissionType.MENU,
//             route: '500',
//             component: '/sys/error/Page500.tsx',
//           },
//         ],
//       },
//     ];

//     return {
//       success: true,
//       message: 'Đăng nhập thành công.',
//       accessToken,
//       refreshToken,
//       user: {
//         id: user._id.toString(),
//         email: user.email,
//         username: user.name,
//         avatar: null,
//         role: user.role,
//         permissions: permission,
//       },
//     };
//   }

//   async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
//     const user: UserDocument | null = await this.usersService.findByEmail(
//       forgotPasswordDto.email,
//     );

//     if (!user) {
//       throw new BadRequestException('Email không tồn tại.');
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     await this.usersService.updateOtp(user.email, otp, otpExpiry);

//     const payload = { id: user._id.toString() };
//     const token = this.jwtService.sign(payload, { expiresIn: '15m' });

//     const resetLink = `http://localhost:3000/reset-password?token=${token}`;

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: this.configService.get<string>('GMAIL_USER'),
//         pass: this.configService.get<string>('GMAIL_PASS'),
//       },
//     });

//     const html = templateHtml(resetLink, otp);

//     const mailOptions = {
//       from: this.configService.get<string>('GMAIL_USER'),
//       to: forgotPasswordDto.email,
//       subject: 'Đặt lại mật khẩu',
//       html: html,
//     };

//     try {
//       await transporter.sendMail(mailOptions);
//       return {
//         success: true,
//         message: 'Đã gửi email đặt lại mật khẩu.',
//       };
//     } catch (error) {
//       console.error('Email sending failed:', error);
//       return {
//         success: false,
//         message: 'Không thể gửi email, nhưng đã tạo OTP và link reset.',
//         otp: otp,
//         resetLink: resetLink,
//       };
//     }
//   }

//   async verifyOtp(verifyOtpDto: VerifyOtpDto) {
//     const user: UserDocument | null = await this.usersService.findByEmail(
//       verifyOtpDto.email,
//     );

//     if (!user) {
//       throw new BadRequestException('Người dùng không tồn tại.');
//     }

//     if (new Date() > user.otpExpiry!) {
//       throw new BadRequestException('OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
//     }

//     if (user.otp !== verifyOtpDto.otp) {
//       throw new BadRequestException(
//         'Mã OTP không đúng. Vui lòng kiểm tra lại.',
//       );
//     }

//     const payload = { id: user._id.toString() };
//     const token = this.jwtService.sign(payload, { expiresIn: '15m' });

//     return {
//       success: true,
//       token,
//     };
//   }

//   async resetPassword(resetPasswordDto: ResetPasswordDto) {
//     try {
//       const decoded: { id: string } = this.jwtService.verify(
//         resetPasswordDto.token,
//       );
//       await this.usersService.updatePassword(
//         decoded.id,
//         resetPasswordDto.newPassword,
//       );

//       return {
//         success: true,
//         message: 'Đổi mật khẩu thành công.',
//       };
//     } catch (error) {
//       console.error('Error resetting password:', error);
//       throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
//     }
//   }

//   logout() {
//     return {
//       success: true,
//       message: 'Đăng xuất thành công.',
//     };
//   }
// }

// Bỏ check permission và trả về tất cả routes

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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '30d',
    });

    // Xóa hoàn toàn permission check - Admin có thể truy cập tất cả
    // const permission = [];

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
        // Không trả về permissions - Admin có thể truy cập tất cả
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
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

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
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

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
      await this.usersService.updatePassword(
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

  logout() {
    return {
      success: true,
      message: 'Đăng xuất thành công.',
    };
  }
}
