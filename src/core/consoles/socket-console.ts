import { Command, Console } from 'nestjs-console';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Console()
export class SocketConsole {
  constructor(@InjectQueue('socket.io') private readonly queue: Queue) {}

  @Command({ command: 'sw' })
  async test() {
    console.log('Testing ...');
    const content = 'A12345';
    const res = await this.queue.add({
      sender: 'odds_change',
      room: 'sr:match:32690467',
      message: content,
    });
    console.log('0k', res);
  }
}
