import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import Stripe from 'stripe';
import { map } from 'async';
import { ProductsService } from 'src/products/products.service';
import { CartItem } from 'src/cart/schemas/cart.schema';
import { OrdersService } from 'src/orders/orders.service';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly productsService: ProductsService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private readonly cartService: CartService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(
    email: string,
    items: CartItem[],
    orderId: string,
  ) {
    const itemsData = await map(items, async (cartItem: CartItem) => {
      const product = await this.productsService.findOne(cartItem.productId);
      const lineItem = {
        price_data: {
          currency: 'pln',
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100,
        },
        quantity: cartItem.quantity,
      };
      return { lineItem, product };
    });

    const lineItems = itemsData.map((item) => item.lineItem);
    const products = itemsData.map((item) => item.product);

    const session = await this.stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: 'Standardowa wysyłka',
            type: 'fixed_amount',
            fixed_amount: {
              amount: Number(process.env.FIXED_DELIVERY_COST) * 100,
              currency: 'pln',
            },
          },
        },
      ],
      success_url: `${process.env.CLIENT_URL}/orders/${orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });
    return { url: session.url, id: session.id, products };
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
        const order = await this.ordersService.complete(event.data.object.id);
        await this.productsService.decreaseStock(order.items);
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
