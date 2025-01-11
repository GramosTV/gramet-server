import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly productsService: ProductsService,
  ) {}
  async getCart(id: string) {
    const cart = await this.cartModel.findOne({ userId: id }).lean().exec();
    return cart || { userId: id, items: [] };
  }

  async addToCart(
    id: string,
    productId: string,
    quantity: number,
    colorId: string,
  ) {
    let cart = await this.cartModel.findOne({ userId: id }).exec();
    if (!cart) {
      cart = new this.cartModel({ userId: id });
      await cart.save();
    }
    const items = await this.productsService.findForCart([
      ...cart.items.map((item) => item.productId),
      productId,
    ]);
    cart.items.push({
      productId,
      quantity,
      colorId,
    });
    return { ...cart, itemData: items };
  }
}
