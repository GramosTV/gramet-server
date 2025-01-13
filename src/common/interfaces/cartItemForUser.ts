import { Color } from './color';

export interface CartItemForUser {
  _id: string;
  name: string;
  image: string;
  price: number;
  colors: Color[];
}
