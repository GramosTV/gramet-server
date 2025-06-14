import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const emailCheck = await this.userModel
        .findOne({ email: createUserDto.email })
        .lean()
        .exec();
      if (emailCheck) {
        throw new Error();
      }
      const user = new this.userModel(createUserDto);
      user.password = await bcrypt.hash(createUserDto.password, 12);
      await user.save();
      await this.mailService.sendRegisterConfirmationEmail(
        createUserDto.email,
        createUserDto.name,
        this.jwtService.sign(
          { userId: user._id },
          {
            expiresIn: '1d',
            secret: this.configService.getOrThrow<string>('JWT_MAIL_SECRET'),
          },
        ),
      );
    } catch (error) {
      throw new InternalServerErrorException('Somethng went wrong');
    }
    return true;
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

  async findOneById(id: string) {
    const user = await this.userModel.findOne({ _id: id }).exec();
    if (!user) {
      throw new NotFoundException(`User doesn't exist`);
    }
    return user;
  }
}
