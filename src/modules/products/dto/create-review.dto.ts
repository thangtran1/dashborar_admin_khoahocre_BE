import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MaxLength(1000)
  comment: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class ReplyReviewDto {
  @IsString()
  @MaxLength(500)
  comment: string;
}
