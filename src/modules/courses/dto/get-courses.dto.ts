import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetCoursesDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Category phải là chuỗi' })
  category?: string;

  @IsOptional()
  @IsString({ message: 'Search phải là chuỗi' })
  search?: string;
}
