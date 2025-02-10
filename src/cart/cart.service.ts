import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ProductsService } from 'src/products/products.service';
import { forEach } from 'async';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  async getCart(id: string) {
    let cart = await this.cartModel.findOne({ userId: id }).exec();
    if (!cart) {
      cart = new this.cartModel({ userId: id });
      await cart.save();
    }

    const items = await this.productsService.findForCart(cart.items);
    await cart.save();
    return { itemData: items };
  }

  async getRawCart(id: string) {
    let cart = await this.cartModel.findOne({ userId: id }).exec();
    if (!cart) {
      cart = new this.cartModel({ userId: id });
      await cart.save();
    }
    return cart;
  }

  async addToCart(
    id: string,
    productId: string,
    quantity: number,
    colorId?: string,
  ) {
    let cart = await this.cartModel.findOne({ userId: id }).exec();
    if (!cart) {
      cart = new this.cartModel({ userId: id });
      await cart.save();
    }
    if (!colorId) {
      const product = await this.productsService.findOne(productId);
      colorId = product.colors[0]._id.toString();
      console.log(colorId);
    }
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.colorId === colorId,
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        colorId,
      });
    }

    const items = await this.productsService.findForCart(cart.items);
    await cart.save();
    return { itemData: items };
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return cart;
  }

  async removeProductFromCarts(productId: string) {
    const carts = await this.cartModel.find({}).exec();
    await forEach(carts, async (cart) => {
      cart.items = cart.items.filter((item) => item.productId !== productId);
      await cart.save();
    });
  }
}
