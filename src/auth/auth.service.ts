import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokensService } from 'src/refresh-tokens/refresh-tokens.service';
import { v4 as uuidv4 } from 'uuid';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
} from 'src/common/interfaces/jwt.interface';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokensService: RefreshTokensService,
    private mailService: MailService,
  ) {}
  generateAccessToken(payload: JwtAccessPayload): string {
    try {
      return this.jwtService.sign(payload, {
        expiresIn: '15m',
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new InternalServerErrorException('Error generating access token');
    }
  }
  async validateRefreshToken(refreshToken: string): Promise<JwtRefreshPayload> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      const token = await this.refreshTokensService.findOne(decoded.jti);
      if (!token || token.isRevoked || token.expiresAt < new Date()) {
        throw new Error();
      }

      const isValid = await bcrypt.compare(refreshToken, token.token);
      if (!isValid) {
        throw new Error();
      }

      return decoded;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.usersService.findOne(email);
      if (!user) {
        throw new Error();
      }
      if (!user.activated) {
        throw new UnauthorizedException('Please verify your email address');
      }
      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) {
        throw new Error();
      }
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new ForbiddenException('Invalid credentials');
    }
  }

  async login(user: UserDocument) {
    try {
      const jti = uuidv4();
      const payload = {
        email: user.email,
        sub: user._id.toString(),
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
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
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
  async verifyEmail(token: string) {
    try {
      const decoded = await this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>('JWT_MAIL_SECRET'),
      });
      const user = await this.usersService.findOneById(decoded.userId);
      user.activated = true;
      await user.save();
      return { message: 'Email verified' };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findOne(email);
      if (user) {
        await this.mailService.sendPasswordResetEmail(
          email,
          this.jwtService.sign(
            { userId: user._id },
            {
              expiresIn: '1h',
              secret: this.configService.getOrThrow<string>(
                'JWT_PASSWORD_SECRET',
              ),
            },
          ),
        );
      }
      return true;
    } catch (error) {
      return true;
    }
  }
  async resetPassword(token: string, password: string) {
    try {
      const decoded = await this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>('JWT_PASSWORD_SECRET'),
      });
      const user = await this.usersService.findOneById(decoded.userId);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      user.password = await bcrypt.hash(password, 12);
      await user.save();
      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error resetting password');
    }
  }
}
