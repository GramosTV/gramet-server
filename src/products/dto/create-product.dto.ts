import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsPositive,
  IsArray,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Category } from 'src/common/enums/category.enum';
import { Material } from 'src/common/enums/material.enum';
import { CreateColorDto } from 'src/common/interfaces/color.interface';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  enName: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsEnum(Category)
  @IsNotEmpty()
  category: Category;

  @ValidateNested({ each: true })
  @Type(() => CreateColorDto)
  colors: CreateColorDto[];

  @IsEnum(Material, { each: true })
  @IsNotEmpty()
  materials: Material[];

  @IsInt()
  @IsPositive()
  price: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsBoolean()
  public: boolean;
}
