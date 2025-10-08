import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: RegisterDto): Promise<UserDocument> {
    const existingUser = await this.userModel
      .findOne({
        email: createUserDto.email,
      })
      .exec();

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: 'user',
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateOtp(
    email: string,
    otp: string,
    otpExpiry: Date,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate({ email }, { otp, otpExpiry }, { new: true })
      .exec();
  }

  async updatePassword(
    id: string,
    newPassword: string,
  ): Promise<UserDocument | null> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          password: hashedPassword,
          otp: null,
          otpExpiry: null,
        },
        { new: true },
      )
      .exec();
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
