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
  Get,
  Query,
  BadRequestException,
  Patch,
  Delete,
  Res,
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
import { Category } from 'src/common/enums/category';
import { Response } from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  async find(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category') category: Category,
  ) {
    if (limit > 50) {
      throw new BadRequestException('Limit must be less than 50');
    }
    if (category && !Object.values(Category).includes(category)) {
      category = undefined;
    }
    return await this.productService.find(page, limit, category);
  }

  @UseGuards(JwtAdminGuard)
  @Get('/admin')
  async findForAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (limit > 500) {
      throw new BadRequestException('Limit must be less than 500');
    }
    return await this.productService.findForAdmin(page, limit);
  }

  // @Get('/:id')
  // async findOne(@Param('id') id: string) {
  //   return await this.productService.findOne(id);
  // }

  @Get('/by-name/:name')
  async findOneByName(@Param('name') name: string) {
    return await this.productService.findOneByName(name);
  }

  @Get('/image/:id')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    try {
      const imageBase64 = await this.productService.getImage(id);
      const imageBuffer = Buffer.from(imageBase64, 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.send(imageBuffer);
    } catch (error) {
      throw error;
    }
  }

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
    return await this.productService.create(productWithImages);
  }

  @UseGuards(JwtAdminGuard)
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async upate(
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: false }))
    files: { images: Express.Multer.File[] },
    @Param('id') id: string,
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
    return await this.productService.update(
      id,
      files.images ? productWithImages : product,
    );
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productService.remove(id);
  }
}
