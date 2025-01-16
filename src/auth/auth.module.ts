import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokensModule } from 'src/refresh-tokens/refresh-tokens.module';
import { JwtAdminStrategy } from './strategies/jwt-admin.strategy';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    RefreshTokensModule,
    ConfigModule.forRoot(),
    JwtModule,
    MailModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtAdminStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
