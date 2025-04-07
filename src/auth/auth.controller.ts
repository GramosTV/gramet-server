import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UserDocument } from 'src/users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user as UserDocument,
    );

    res.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });

    return res.send({ accessToken });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: FastifyRequest) {
    const refreshToken = req.cookies['refreshToken'];
    return await this.authService.logout(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: FastifyRequest) {
    return req.user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@Req() req: FastifyRequest) {
    const refreshToken = req.cookies['refreshToken'];
    return await this.authService.refreshToken(refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(@Body() { token }) {
    return await this.authService.verifyEmail(token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() { email }) {
    return await this.authService.forgotPassword(email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() { token, password }) {
    return await this.authService.resetPassword(token, password);
  }
}
