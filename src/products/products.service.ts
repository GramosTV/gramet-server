import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Color } from './schemas/color.schema';
import { Category } from 'src/common/enums/category.enum';
import { map } from 'async';
import { CartItem } from 'src/cart/schemas/cart.schema';
import { CartItemForUser } from 'src/common/interfaces/cart-item-for-user.interface';
import { formatURL } from 'src/lib/utils';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @Inject(forwardRef(() => CartService))
    private readonly cartService: CartService,
  ) {}

  async find(
    page: number,
    limit: number,
    category: Category | undefined,
    minPrice: number,
    maxPrice: number,
  ): Promise<{
    products: { name: string; image: string }[];
    pageCount: number;
    totalCount: number;
  }> {
    const baseMatch: {
      public: boolean;
      price: { $gte: number; $lte: number };
      category?: Category;
    } = {
      public: true,
      price: { $gte: minPrice, $lte: maxPrice },
    };
    if (category) {
      baseMatch.category = category;
    }
    const totalCount = await this.productModel.countDocuments(baseMatch);
    const pageCount = Math.ceil(totalCount / limit);

    const products = await this.productModel
      .aggregate([
        { $match: baseMatch },
        {
          $project: {
            name: 1,
            enName: 1,
            image: { $arrayElemAt: ['$images', 0] },
            price: 1,
            url: 1,
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ])
      .exec();

    return { products, pageCount, totalCount };
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
                enName: 1,
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
    return products.filter((product) => product !== null);
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
    const product = new this.productModel(createProductDto);
    product.url = formatURL(product.name);
    return product.save();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findOneByUrl(url: string): Promise<Product> {
    const product = await this.productModel.findOne({ url });
    if (!product || !product.public) {
      throw new NotFoundException(`Product with name ${url} not found`);
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
    if (product.public && !updateProductDto.public) {
      await this.cartService.removeProductFromCarts(id);
    }
    Object.assign(product, updateProductDto);
    product.url = formatURL(product.name);
    return product.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.cartService.removeProductFromCarts(id);
  }

  async decreaseStock(cartItems: CartItem[]): Promise<void> {
    for (const item of cartItems) {
      const product = await this.productModel.findOne({
        _id: new Types.ObjectId(item.productId),
        'colors._id': new Types.ObjectId(item.colorId),
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      const color = product.colors.find((color) => color._id === item.colorId);
      if (color.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ID ${item.productId} and color ID ${item.colorId}`,
        );
      }

      color.stock -= item.quantity;
      await product.save();
    }
  }

  async getObjFile(id: string): Promise<string> {
    const productRecord = await this.productModel.findById(id);
    if (!productRecord) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (!productRecord.obj) {
      throw new NotFoundException(
        `OBJ file not found for product with ID ${id}`,
      );
    }
    return productRecord.obj;
  }
}
