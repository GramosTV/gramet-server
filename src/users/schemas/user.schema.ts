import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Roles } from 'src/common/enums/roles';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: string;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  address: string;

  @Prop()
  phoneNumber: string;

  @Prop({ default: Roles.CUSTOMER, enum: Roles })
  role: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: [CartItemSchema], default: [] })
  cart: CartItem[];
}

export const UserSchema = SchemaFactory.createForClass(User);
