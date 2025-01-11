import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Product } from 'src/products/schemas/product.schema';
import { CartItem } from 'src/cart/schemas/cart.schema';

export class CreateTransactionDto {
  @IsMongoId()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItem)
  order: CartItem[];
}
