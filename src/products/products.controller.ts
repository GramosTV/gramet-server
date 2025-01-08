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
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { convertToBase64, compressImage } from 'src/lib/utils';
import { map } from 'async';
import { Product } from './schemas/product.schema';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @UseGuards(JwtAdminGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async create(
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: true }))
    files: { images: Express.Multer.File[] },
    @Body() product: Omit<Product, 'images'>,
  ) {
    product.colors = JSON.parse((product as any).colors);
    product.materials = JSON.parse((product as any).materials);
    const imagesBase64 = await map(
      files.images,
      async (file: Express.Multer.File) =>
        await compressImage(convertToBase64(file)),
    );
    const productWithImages = {
      ...product,
      images: imagesBase64,
    };
    console.log(productWithImages.images);
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
