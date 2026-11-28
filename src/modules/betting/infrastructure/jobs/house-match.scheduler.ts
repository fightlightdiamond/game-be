import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { OpenHouseMatchCommand } from '../../application/commands/open-house-match/open-house-match.command';

@Injectable()
export class HouseMatchScheduler {
  constructor(private readonly commandBus: CommandBus) {}

  @Cron('0 */3 * * * *')
  async execute(): Promise<void> {
    await this.commandBus.execute(new OpenHouseMatchCommand());
  }
}
