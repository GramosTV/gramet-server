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
} from 'class-validator';
import { Material } from 'src/common/enums/material';
import { CreateColorDto } from 'src/common/interfaces/color';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateColorDto)
  @IsOptional()
  colors?: CreateColorDto[];

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
}
