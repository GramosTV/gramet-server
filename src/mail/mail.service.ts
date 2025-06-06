import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}
  async sendRegisterConfirmationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const confirmationUrl = `${this.configService.getOrThrow<string>('CLIENT_URL')}/verify-email?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Gramet! Confirm your Email',
      template: './confirmation',
      context: {
        name,
        confirmationUrl,
      },
    });
  }
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.getOrThrow<string>('CLIENT_URL')}/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Gramet - Reset your password',
      template: './reset-password',
      context: {
        resetUrl,
      },
    });
  }
}
