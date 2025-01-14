import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'localhost',
        port: 1025,
        secure: false,
        adapter: new HandlebarsAdapter(),
        // auth: {
        //   user: 'your-email@example.com',
        //   pass: 'your-email-password',
        // },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },

      template: {
        dir: process.cwd() + '/templates/',
        adapter: new HandlebarsAdapter(), // Use Handlebars for templating
        options: {
          strict: true,
        },
      },
    }),
    JwtModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
