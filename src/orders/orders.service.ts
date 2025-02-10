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
import { Model, Types } from 'mongoose';
import { StripeService } from 'src/transactions/stripe.service';
import { CartService } from 'src/cart/cart.service';
import { DeliveryStatus, PaymentStatus } from 'src/common/enums/status';
import { Product } from 'src/products/schemas/product.schema';
import { ProductsService } from 'src/products/products.service';
import { map } from 'async';
import { CartItem } from 'src/cart/schemas/cart.schema';
// import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
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
      const { url, id, products } =
        await this.stripeService.createCheckoutSession(
          email,
          cart.items,
          createdOrder._id.toString(),
        );
      createdOrder.transactionId = id;
      createdOrder.items.forEach((item) => {
        const product = products.find(
          (p: Product & { _id: Types.ObjectId }) => {
            return p._id.equals(new Types.ObjectId(item.productId));
          },
        );
        item.priceAtTimeOfOrder = product.price;
      });
      await createdOrder.save();
      await this.cartService.clearCart(userId);
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

  async findOne(orderId: string, userId: string, admin: boolean) {
    try {
      const query = admin ? { _id: orderId } : { _id: orderId, userId };
      const order = await this.orderModel.findOne(query).exec();
      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }
      order.items = await map(order.items, async (item: CartItem) => {
        const product = await this.productsService.findOne(item.productId);
        return { ...item, product };
      });
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

  async findForAdmin(page: number, limit: number) {
    try {
      const totalCount = await this.orderModel.countDocuments({});
      const pageCount = Math.ceil(totalCount / limit);
      const skip = (page - 1) * limit;
      const orders = await this.orderModel
        .find()
        .skip(skip)
        .limit(limit)
        .exec();
      return { orders, pageCount };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStatistics() {
    try {
      const orders = await this.orderModel.find().exec();
      let totalOrders = orders.length;
      let totalProductsSold = 0;
      let totalSales = 0;
      let awaitingDispatchCount = 0;

      orders.forEach((order) => {
        if (order.deliveryStatus === 'NOT_DISPATCHED') {
          awaitingDispatchCount++;
        }
        order.items.forEach((item) => {
          totalProductsSold += item.quantity;
          if (item.priceAtTimeOfOrder) {
            totalSales += item.quantity * item.priceAtTimeOfOrder;
          }
        });
      });
      return {
        totalOrders,
        totalProductsSold,
        totalSales: totalSales.toFixed(2),
        awaitingDispatchCount,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to compute statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async dispatch(orderId: string) {
    try {
      const order = await this.orderModel.findById(orderId).exec();
      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }
      if (order.deliveryStatus === DeliveryStatus.DISPATCHED) {
        throw new HttpException(
          'Order already dispatched',
          HttpStatus.BAD_REQUEST,
        );
      }
      order.deliveryStatus = DeliveryStatus.DISPATCHED;
      await order.save();
      return { message: 'Order dispatched successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to dispatch order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
