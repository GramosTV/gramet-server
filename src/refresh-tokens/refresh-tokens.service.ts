import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import * as bcrypt from 'bcrypt';
import { Cron } from '@nestjs/schedule';
import { JwtRefreshPayload } from 'src/common/interfaces/jwt.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService,
  ) {}

  async create(
    userId: Types.ObjectId,
    payload: JwtRefreshPayload,
    jti: string,
  ): Promise<string> {
    try {
      const token = this.jwtService.sign(payload, {
        expiresIn: '30d',
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const activeTokens = await this.refreshTokenModel.find({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      if (activeTokens.length >= 3) {
        const tokenToDelete = activeTokens.reduce((prev, curr) =>
          prev.expiresAt < curr.expiresAt ? prev : curr,
        );

        await this.refreshTokenModel.deleteOne({ _id: tokenToDelete._id });
      }

      const refreshToken = new this.refreshTokenModel({
        userId,
        jti,
        token: await bcrypt.hash(token, 10),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await refreshToken.save();
      return token;
    } catch (error) {
      throw new InternalServerErrorException('Error creating refresh token');
    }
  }

  async findOne(jti: string): Promise<RefreshTokenDocument> {
    return await this.refreshTokenModel.findOne({ jti }).exec();
  }

  async revoke(jti: string): Promise<void> {
    await this.refreshTokenModel.updateOne({ jti }, { isRevoked: true }).exec();
  }

  async revokeAllTokensForUser(userId: string): Promise<void> {
    await this.refreshTokenModel
      .updateMany({ userId }, { isRevoked: true })
      .exec();
  }

  async deleteExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.refreshTokenModel.deleteMany({ expiresAt: { $lt: now } }).exec();
  }

  @Cron('0 0 */7 * *')
  async handleExpiredTokensDeletion() {
    await this.deleteExpiredTokens();
  }
}
