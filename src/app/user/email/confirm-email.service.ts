import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { confirmEmailLink } from './confirm-email-link';

@Injectable()
export class ConfirmEmailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sent(userId, from = 'phamminhcuong1704bnfrv@gmail.com') {
    return this.mailerService
      .sendMail({
        to: 'i.am.m.cuong@gmail.com', // list of receivers
        from: from, // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        html: `<b>${confirmEmailLink(userId)}</b>`, // HTML body content
      })
      .then((sentMessageInfo) => {
        console.log('0k', sentMessageInfo);
      })
      .catch((e) => {
        console.log({ e });
      });
  }
}
