import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export interface Color {
  _id: string;
  name: string;
  hex: string;
  stock: number;
}

export class CreateColorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  hex: string;

  @IsInt()
  @IsPositive()
  stock: number;
}
