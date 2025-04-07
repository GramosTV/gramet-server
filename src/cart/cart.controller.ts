import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtAccessPayload } from 'src/common/interfaces/jwt.interface';
import { AddToCartDto } from './dto/addToCart-dto';
import { FastifyRequest } from 'fastify';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCart(@Req() req: FastifyRequest) {
    const user = req.user as JwtAccessPayload;
    return await this.cartService.getCart(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async addToCart(
    @Req() req: FastifyRequest,
    @Body() { productId, quantity, colorId }: AddToCartDto,
  ) {
    const user = req.user as JwtAccessPayload;
    return await this.cartService.addToCart(
      user.sub,
      productId,
      quantity,
      colorId,
    );
  }
}
