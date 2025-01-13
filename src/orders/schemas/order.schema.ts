import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CartItem } from 'src/cart/schemas/cart.schema';
import { Status } from 'src/common/enums/status';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({
    required: true,
    enum: Status,
    default: Status.PENDING,
  })
  status: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  houseNumber: string;

  @Prop()
  apartmentNumber?: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true })
  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
