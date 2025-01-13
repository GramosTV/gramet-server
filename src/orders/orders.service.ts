import {
  Injectable,
  HttpException,
  HttpStatus,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model } from 'mongoose';
import { StripeService } from 'src/transactions/stripe.service';
import { CartService } from 'src/cart/cart.service';
import { PaymentStatus } from 'src/common/enums/status';
// import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    private readonly cartService: CartService,
  ) {}
  async create(userId: string, email: string, createOrderDto: CreateOrderDto) {
    try {
      const cart = await this.cartService.getRawCart(userId);
      if (!cart.items.length) {
        throw new HttpException('Cart is empty', HttpStatus.BAD_REQUEST);
      }
      const createdOrder = new this.orderModel({
        ...createOrderDto,
        userId,
        items: cart.items,
      });
      const { url, id } = await this.stripeService.createCheckoutSession(
        email,
        cart.items,
      );
      createdOrder.transactionId = id;
      await createdOrder.save();
      return { url };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to place order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // findAll() {
  //   return `This action returns all orders`;
  // }

  async complete(transactionId: string) {
    const order = await this.orderModel.findOne({ transactionId }).exec();
    order.paymentStatus = PaymentStatus.COMPLETED;
    await order.save();
  }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
