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
      throw new HttpException(
        'Failed to place order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async complete(transactionId: string) {
    const order = await this.orderModel.findOne({ transactionId }).exec();
    order.paymentStatus = PaymentStatus.COMPLETED;
    return await order.save();
  }

  async findOne(orderId: string) {
    try {
      const order = await this.orderModel.findOne({ _id: orderId }).exec();
      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }
      return order;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByUserId(userId: string) {
    try {
      const orders = await this.orderModel.find({ userId }).exec();
      return orders;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllForAdmin() {
    try {
      const orders = await this.orderModel.find().exec();
      return orders;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
