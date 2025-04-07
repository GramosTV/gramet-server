import { Controller, Post, Body, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { StripeService } from './stripe.service';
import { FastifyRequest } from 'fastify';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('/stripe/webhook')
  async handleCheckoutWebhook(
    @Req() request: FastifyRequest,
    @Body() body: any,
  ) {
    return await this.stripeService.handleCheckoutWebhook(request, body);
  }
}
