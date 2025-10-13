import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document & { _id: Types.ObjectId };

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  name: string;

  @Prop({
    required: true,
    minlength: 6,
  })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
    index: true,
  })
  role: UserRole;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    index: true,
  })
  status: UserStatus;

  @Prop()
  avatar?: string;

  @Prop()
  phone?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  address?: string;

  @Prop()
  bio?: string;

  // OTP fields for password reset
  @Prop()
  otp?: string;

  @Prop()
  otpExpiry?: Date;

  // OAuth fields
  @Prop()
  googleId?: string;

  @Prop()
  facebookId?: string;

  // Tracking fields
  @Prop({ default: Date.now })
  lastLoginAt?: Date;

  @Prop({ default: 0 })
  loginCount: number;

  @Prop({ default: true })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationExpiry?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLoginAt: -1 });

// Remove password from JSON output
UserSchema.set('toJSON', {
  transform: function (doc: any, ret: Record<string, any>) {
    const result = { ...ret };
    delete result.password;
    delete result.otp;
    delete result.otpExpiry;
    delete result.emailVerificationToken;
    delete result.emailVerificationExpiry;
    return result;
  },
});
