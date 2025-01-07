import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokensService } from 'src/refresh-tokens/refresh-tokens.service';
import { v4 as uuidv4 } from 'uuid';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
} from 'src/common/interfaces/jwtPayload';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokensService: RefreshTokensService,
  ) {}

  generateAccessToken(payload: JwtAccessPayload): string {
    try {
      return this.jwtService.sign(payload, {
        expiresIn: '10m',
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error generating access token');
    }
  }

  async validateRefreshToken(refreshToken: string): Promise<JwtRefreshPayload> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const token = await this.refreshTokensService.findOne(decoded.jti);
      if (!token || token.isRevoked || token.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const isValid = await bcrypt.compare(refreshToken, token.token);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return decoded;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findOne(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error validating user');
    }
  }

  async login(user: any) {
    try {
      const jti = uuidv4();
      const payload = {
        email: user.email,
        sub: user._id,
        jti,
        role: user.role,
      };
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = await this.refreshTokensService.create(
        user._id,
        payload,
        jti,
      );
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error during login process');
    }
  }

  async logout(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      await this.refreshTokensService.revoke(decoded.jti);
      return { message: 'Logout successful' };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.validateRefreshToken(refreshToken);
      const newAccessToken = this.generateAccessToken({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      });
      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
