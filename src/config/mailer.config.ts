import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export const getMailerConfig = (
  configService: ConfigService,
): MailerOptions => ({
  transport: {
    host: configService.get<string>('SMTP_HOST'),
    port: configService.get<number>('SMTP_PORT'),
    auth: {
      user: configService.get<string>('SMTP_USER') || '',
      pass: configService.get<string>('SMTP_PASS') || '',
    },
    secure: false,
  },
  defaults: {
    from: configService.get<string>('SMTP_EMAIL_FROM'),
  },
});
