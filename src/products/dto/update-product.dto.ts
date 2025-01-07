import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsPositive,
  IsOptional,
  IsArray,
  ArrayMinSize,
  IsUrl,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Material } from 'src/common/enums/material';
import { CreateColorDto } from 'src/common/interfaces/color';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  brand?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateColorDto)
  colors?: CreateColorDto[];

  @IsEnum(Material)
  @IsOptional()
  @IsNotEmpty()
  material?: Material;

  @IsInt()
  @IsOptional()
  @IsPositive()
  stock?: number;

  @IsInt()
  @IsOptional()
  @IsPositive()
  price?: number;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images?: string[];
}
