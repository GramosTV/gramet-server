import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Color } from 'src/products/schemas/color.schema';

@Schema()
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: string;

  @Prop({ type: Types.ObjectId, ref: 'Color', required: true })
  colorId: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop()
  priceAtTimeOfOrder?: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

export type CartDocument = HydratedDocument<Cart>;

@Schema()
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
