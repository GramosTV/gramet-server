import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsPositive,
  IsArray,
  ArrayMinSize,
  IsUrl,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Material } from 'src/common/enums/material';
import { Color, CreateColorDto } from 'src/common/interfaces/color';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @ValidateNested({ each: true })
  @Type(() => CreateColorDto)
  colors: CreateColorDto[];

  @IsEnum(Material, { each: true })
  @IsNotEmpty()
  materials: Material[];

  @IsInt()
  @IsPositive()
  stock: number;

  @IsInt()
  @IsPositive()
  price: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];
}
