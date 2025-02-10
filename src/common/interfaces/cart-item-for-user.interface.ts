import { Color } from './color.interface';

export interface CartItemForUser {
  _id: string;
  name: string;
  image: string;
  price: number;
  colors: Color[];
}
