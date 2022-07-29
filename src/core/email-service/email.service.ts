import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  public async example() {
    return this.mailerService
      .sendMail({
        to: 'i.am.m.cuong@gmail.com', // list of receivers
        from: 'phamminhcuong1704bnfrv@gmail.com', // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        html: '<b>welcome</b>', // HTML body content
      })
      .then((sentMessageInfo) => {
        console.log('0k', sentMessageInfo);
      })
      .catch((e) => {
        console.log({ e });
      });
  }
}
