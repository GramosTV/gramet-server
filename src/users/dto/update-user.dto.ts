import {
  IsEmail,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

class UpdateCartItemDto {
  @IsString()
  @Length(24, 24)
  productId: string;

  @IsOptional()
  @Min(1)
  @Max(100)
  quantity: number;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  surname?: string;

  @IsOptional()
  @IsEmail()
  @Length(5, 100)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(6, 20)
  password?: string;

  @IsOptional()
  @IsString()
  @Length(5, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(9, 15)
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(['customer', 'admin'])
  role?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCartItemDto)
  cart?: UpdateCartItemDto[];
}
