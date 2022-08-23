import { Command, Console } from 'nestjs-console';
import { EmailService } from '../email-service/email.service';

@Console()
export class EmailConsole {
  constructor(private readonly emailService: EmailService) {}

  @Command({ command: 'mail' })
  async test() {
    await this.emailService.example();
  }
}
