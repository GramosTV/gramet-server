import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from 'src/common/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
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

  @Prop({ default: Role.CUSTOMER, enum: Role })
  role: Role;

  @Prop({ default: false })
  activated: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Cart' }], default: [] })
  cart: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
