import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendRegisterConfirmationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const confirmationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Our App! Confirm your Email',
      template: './confirmation',
      context: {
        name,
        confirmationUrl,
      },
    });
  }
}
