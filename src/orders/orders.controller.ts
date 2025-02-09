import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtAccessPayload } from 'src/common/interfaces/jwtPayload';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guards';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Roles } from 'src/common/enums/roles';

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

  @UseGuards(JwtAdminGuard)
  @Patch('/dispatch/:id')
  async dispatch(@Param('id') id: string) {
    return await this.ordersService.dispatch(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/findById/:id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtAccessPayload },
  ) {
    return await this.ordersService.findOne(
      id,
      req.user.sub,
      req.user.role === Roles.ADMIN,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async findAllByUserId(@Req() req: Request & { user: JwtAccessPayload }) {
    return await this.ordersService.findAllByUserId(req.user.sub);
  }

  @UseGuards(JwtAdminGuard)
  @Get('/forAdmin')
  async findForAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.ordersService.findForAdmin(page, limit);
  }

  @UseGuards(JwtAdminGuard)
  @UseInterceptors(CacheInterceptor)
  @Get('/statistics')
  @CacheKey('order_statistics')
  @CacheTTL(60 * 60 * 24)
  async getStatistics() {
    return await this.ordersService.getStatistics();
  }
}
