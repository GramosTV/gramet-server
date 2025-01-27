import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Material } from 'src/common/enums/material';
import { Color } from 'src/common/interfaces/color';
import { ColorSchema } from './color.schema';
import { Category } from 'src/common/enums/category';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, enum: Category })
  category: Category;

  @Prop({ type: [ColorSchema], required: true })
  colors: Color[];

  @Prop({ required: true, type: [String], enum: Material })
  materials: Material[];

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true })
  images: string[];

  @Prop({ required: true, default: false })
  public: boolean;

  @Prop()
  obj: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
