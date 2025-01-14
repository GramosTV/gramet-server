import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Roles } from 'src/common/enums/roles';
import { Color } from 'src/products/schemas/color.schema';

export type UserDocument = HydratedDocument<User>;

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

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ default: Roles.CUSTOMER, enum: Roles })
  role: string;

  @Prop({ default: false })
  activated: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Cart' }], default: [] })
  cart: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
