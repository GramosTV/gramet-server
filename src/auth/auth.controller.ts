import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtAccessPayload } from 'src/common/interfaces/jwtPayload';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    try {
      const { accessToken, refreshToken } = await this.authService.login(
        req.user,
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return res.send({ accessToken });
    } catch (error) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .send({ message: 'Something went wrong, please try again' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request & { user: JwtAccessPayload }) {
    return await this.authService.logout(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@Req() request: Request) {
    const refreshToken = request.cookies['refreshToken'];
    return await this.authService.refreshToken(refreshToken);
  }
}
