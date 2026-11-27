import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { StartMatchCommand } from '../../application/commands/start-match/start-match.command';

@Injectable()
export class PreMatchCron {
  constructor(private readonly commandBus: CommandBus) {}

  @Cron('0 */3 * * * *')
  async execute(): Promise<void> {
    await this.commandBus.execute(new StartMatchCommand());
  }
}
