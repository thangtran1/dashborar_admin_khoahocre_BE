import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAddressDto {
  @IsEnum([1, 2])
  type: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  full_address: string;

  @IsNumber()
  province_id: number;

  @IsNumber()
  district_id: number;

  @IsNumber()
  ward_id: number;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
