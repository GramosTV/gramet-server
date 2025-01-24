import { forwardRef, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeService } from './stripe.service';
import { ProductsService } from 'src/products/products.service';
import { ProductsModule } from 'src/products/products.module';
import { OrdersModule } from 'src/orders/orders.module';
import { CartService } from 'src/cart/cart.service';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    ProductsModule,
    forwardRef(() => OrdersModule),
    CartModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, StripeService],
  exports: [TransactionsService, StripeService],
})
export class TransactionsModule {}
