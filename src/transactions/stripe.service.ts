// src/transactions/stripe.service.ts
import { HttpException, HttpStatus, Injectable, Request } from '@nestjs/common';
import { Product } from 'src/products/schemas/product.schema';
import Stripe from 'stripe';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { map } from 'async';
import { ProductsService } from 'src/products/products.service';
import { CartItem } from 'src/cart/schemas/cart.schema';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly productService: ProductsService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(
    createTransactionDto: CreateTransactionDto,
  ): Promise<string> {
    const lineItems = await map(
      createTransactionDto.order,
      async (cartItem: CartItem) => {
        const product = await this.productService.findOne(cartItem.productId);
        return {
          price_data: {
            currency: 'pln',
            product_data: {
              name: product.name,
            },
            unit_amount: product.price * 100,
          },
          quantity: 1,
        };
      },
    );

    const session = await this.stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/succes`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    return session.url;
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
        // TODO: Handle successful payment
      } else {
        throw new Error('Invalid event type');
      }
    } catch (err) {
      throw new HttpException(
        `Invalid webhook signature`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
