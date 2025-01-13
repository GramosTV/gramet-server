// src/transactions/stripe.service.ts
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Request,
} from '@nestjs/common';
import { Product } from 'src/products/schemas/product.schema';
import Stripe from 'stripe';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { map } from 'async';
import { ProductsService } from 'src/products/products.service';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { CartItemForUser } from 'src/common/interfaces/cartItemForUser';
import { CartItem } from 'src/cart/schemas/cart.schema';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly productService: ProductsService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(email: string, items: CartItem[]) {
    const lineItems = await map(items, async (cartItem: CartItem) => {
      const product = await this.productService.findOne(cartItem.productId);
      return {
        price_data: {
          currency: 'pln',
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100,
        },
        quantity: cartItem.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      // shipping_address_collection: {
      //   allowed_countries: ['PL'],
      // },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: 'Standardowa wysyłka',
            type: 'fixed_amount',
            fixed_amount: {
              amount: 11,
              currency: 'pln',
            },
          },
        },
      ],
      success_url: `${process.env.CLIENT_URL}/home`,
      cancel_url: `${process.env.CLIENT_URL}/store/checkout`,
    });
    return { url: session.url, id: session.id };
  }

  async handleCheckoutWebhook(request: Request, body: any) {
    const sig = request.headers['stripe-signature'];
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
      if (event.type === 'checkout.session.completed') {
        await this.ordersService.complete(event.data.object.id);
      } else {
        throw new HttpException('Invalid event type', HttpStatus.BAD_REQUEST);
      }
    } catch (err) {
      throw new HttpException(
        `Invalid webhook signature`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
