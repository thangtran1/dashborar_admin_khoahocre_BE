import { IsArray, IsEnum, IsString, ArrayNotEmpty } from 'class-validator';
import { UserStatus } from '../schemas/user.schema';

export class BulkUpdateStatusDto {
  @IsArray({ message: 'IDs phải là một mảng' })
  @ArrayNotEmpty({ message: 'Danh sách IDs không được để trống' })
  @IsString({ each: true, message: 'Mỗi ID phải là chuỗi' })
  ids: string[];

  @IsEnum(UserStatus, { message: 'Trạng thái không hợp lệ' })
  status: UserStatus;
}

export class BulkDeleteDto {
  @IsArray({ message: 'IDs phải là một mảng' })
  @ArrayNotEmpty({ message: 'Danh sách IDs không được để trống' })
  @IsString({ each: true, message: 'Mỗi ID phải là chuỗi' })
  ids: string[];
}
