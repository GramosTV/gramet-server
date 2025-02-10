import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsPositive,
  IsOptional,
  IsArray,
  ArrayMinSize,
  IsUrl,
  IsEnum,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Category } from 'src/common/enums/category.enum';
import { Material } from 'src/common/enums/material.enum';
import { CreateColorDto } from 'src/common/interfaces/color.interface';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  enName?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateColorDto)
  @IsOptional()
  colors?: CreateColorDto[];

  @IsEnum(Category)
  @IsOptional()
  category?: Category;

  @IsEnum(Material, { each: true })
  @IsOptional()
  materials?: Material[];

  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  public?: boolean;
}
