import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin.guards';
import { FilesInterceptor } from '@nestjs/platform-express';
import { convertToBase64, compressImage } from 'src/lib/utils';
import { map } from 'async';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @UseGuards(JwtAdminGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: true }))
    files: { images: Express.Multer.File[] },
    @Body() createProductDto: CreateProductDto,
  ) {
    const imagesBase64 = await map(
      files.images,
      async (file: Express.Multer.File) =>
        await compressImage(convertToBase64(file)),
    );
    const productWithImages = {
      ...createProductDto,
      images: imagesBase64,
    };
    return await this.productService.create(productWithImages);
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
