import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    const emailCheck = await this.userModel
      .findOne({ email: createUserDto.email })
      .lean()
      .exec();
    if (emailCheck) {
      throw new ConflictException('Email already exists');
    }
    const user = new this.userModel(createUserDto);
    user.password = await bcrypt.hash(createUserDto.password, 12);
    await user.save();
    return 'ok';
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(email: string) {
    const user = await this.userModel.findOne({ email }).lean().exec();
    if (!user) {
      // Error not specific on purpose for security reasons
      throw new NotFoundException(`Email or password is incorrect`);
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
