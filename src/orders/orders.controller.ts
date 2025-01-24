import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtAccessPayload } from 'src/common/interfaces/jwtPayload';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guards';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: Request & { user: JwtAccessPayload },
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const res = await this.ordersService.create(
      req.user.sub,
      req.user.email,
      createOrderDto,
    );
    return { url: res.url };
  }

  @Get('/findById/:id')
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async findAllByUserId(@Req() req: Request & { user: JwtAccessPayload }) {
    return await this.ordersService.findAllByUserId(req.user.sub);
  }

  @UseGuards(JwtAdminGuard)
  @Get('/allForAdmin')
  async findAllForAdmin() {
    return await this.ordersService.findAllForAdmin();
  }
}
