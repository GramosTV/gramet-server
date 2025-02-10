import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtAccessPayload } from 'src/common/interfaces/jwt.interface';
import { Request } from 'express';
import { AddToCartDto } from './dto/addToCart-dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCart(@Req() req: Request & { user: JwtAccessPayload }) {
    return await this.cartService.getCart(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async addToCart(
    @Req() req: Request & { user: JwtAccessPayload },
    @Body() { productId, quantity, colorId }: AddToCartDto,
  ) {
    return await this.cartService.addToCart(
      req.user.sub,
      productId,
      quantity,
      colorId,
    );
  }
}
