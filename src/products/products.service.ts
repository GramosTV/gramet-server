import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Color } from './schemas/color.schema';
import { Category } from 'src/common/enums/category';
import { map } from 'async';
import { CartItem } from 'src/cart/schemas/cart.schema';
import { CartItemForUser } from 'src/common/interfaces/cartItemForUser';

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

  async getImage(id: string): Promise<string> {
    try {
      const products = await this.productModel
        .aggregate([
          { $match: { public: true, _id: new Types.ObjectId(id) } },
          {
            $project: {
              image: { $arrayElemAt: ['$images', 0] },
            },
          },
        ])
        .exec();
      return products[0].image;
    } catch (error) {
      throw new NotFoundException(`Image with product ID ${id} not found`);
    }
  }

  async findForCart(data: CartItem[]): Promise<CartItemForUser[]> {
    const products = await map(data, async (e: CartItem) => {
      const res = await (
        await this.productModel
          .aggregate([
            {
              $match: {
                public: true,
                _id: new Types.ObjectId(e.productId),
                'colors._id': new Types.ObjectId(e.colorId),
              },
            },
            {
              $project: {
                name: 1,
                // image: { $arrayElemAt: ['$images', 0] },
                price: 1,
                colors: 1,
              },
            },
          ])
          .exec()
      )[0];

      res.quantity = e.quantity;
      return res;
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

  async findOneByName(name: string): Promise<Product> {
    const product = await this.productModel.findOne({ name });
    if (!product) {
      throw new NotFoundException(`Product with name ${name} not found`);
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
