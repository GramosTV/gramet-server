import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

@Schema()
export class Color {
  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  hex: string;

  @Prop({ required: true })
  @IsInt()
  @IsPositive()
  stock: number;
}

export const ColorSchema = SchemaFactory.createForClass(Color);
