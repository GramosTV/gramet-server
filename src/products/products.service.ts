import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Color } from './schemas/color.schema';
import { Category } from 'src/common/enums/category';
import { map } from 'async';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async find(
    page: number,
    limit: number,
    category: Category | undefined,
  ): Promise<{
    products: { name: string; image: string }[];
    pageCount: number;
  }> {
    const matchStage = category ? { public: true, category } : { public: true };

    const totalCount = await this.productModel.countDocuments(matchStage);
    const pageCount = Math.ceil(totalCount / limit);

    const products = await this.productModel
      .aggregate([
        { $match: matchStage },
        {
          $project: {
            name: 1,
            image: { $arrayElemAt: ['$images', 0] },
            price: 1,
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ])
      .exec();

    return { products, pageCount };
  }

  async findForCart(ids: string[]): Promise<{ name: string; image: string }[]> {
    const products = await map(ids, async (id: string) => {
      return await this.productModel
        .aggregate([
          { $match: { public: true, _id: id } },
          {
            $project: {
              name: 1,
              image: { $arrayElemAt: ['$images', 0] },
              price: 1,
              colors: 1,
            },
          },
        ])
        .exec()[0];
    });
    return products;
  }

  async findForAdmin(
    page: number,
    limit: number,
  ): Promise<{
    products: { name: string; colors: Color[]; public: boolean }[];
    pageCount: number;
  }> {
    const totalCount = await this.productModel.countDocuments({});
    const pageCount = Math.ceil(totalCount / limit);

    const products = await this.productModel
      .aggregate([
        {
          $project: {
            name: 1,
            colors: 1,
            public: 1,
            // image: { $arrayElemAt: ['$images', 0] },
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ])
      .exec();

    return { products, pageCount };
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    Object.assign(product, updateProductDto);
    return product.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
