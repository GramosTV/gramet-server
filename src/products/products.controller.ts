import { Body, Controller, Post, Put, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guards';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @UseGuards(JwtAdminGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @UseGuards(JwtAdminGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(id, updateProductDto);
  }
}
