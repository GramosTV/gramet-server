import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly stripeService: StripeService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  // @Post()
  // async create(@Body() createTransactionDto: CreateTransactionDto) {
  //   await this.transactionsService.create(createTransactionDto);
  //   const sessionUrl =
  //     await this.stripeService.createCheckoutSession(createTransactionDto);
  //   return { url: sessionUrl };
  // }

  @Post('/stripe/webhook')
  async handleCheckoutWebhook(@Req() request, @Body() body) {
    return await this.stripeService.handleCheckoutWebhook(request, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    return this.transactionsService.findByUser(userId);
  }
}
