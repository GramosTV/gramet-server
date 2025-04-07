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
import { JwtAccessPayload } from 'src/common/interfaces/jwt.interface';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guards';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Role } from 'src/common/enums/role.enum';
import { FastifyRequest } from 'fastify';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: FastifyRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const user = req.user as JwtAccessPayload;
    const res = await this.ordersService.create(
      user.sub,
      user.email,
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
  async findOne(@Param('id') id: string, @Req() req: FastifyRequest) {
    const user = req.user as JwtAccessPayload;
    return await this.ordersService.findOne(
      id,
      user.sub,
      user.role === Role.ADMIN,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async findAllByUserId(@Req() req: FastifyRequest) {
    const user = req.user as JwtAccessPayload;
    return await this.ordersService.findAllByUserId(user.sub);
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
