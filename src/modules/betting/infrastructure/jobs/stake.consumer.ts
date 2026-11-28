import { Process, Processor } from '@nestjs/bull';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bull';
import { RevealHouseMatchCommand } from '../../application/commands/reveal-house-match/reveal-house-match.command';
import { SettleHouseMatchCommand } from '../../application/commands/settle-house-match/settle-house-match.command';
import { NameQueueConstant } from '../../../../shared/constants/name-queue.constant';

@Processor('bet')
export class StakeConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @Process(NameQueueConstant.FIGHT_QUEUE)
  async handleReveal(job: Job<{ id: number }>): Promise<void> {
    await this.commandBus.execute(new RevealHouseMatchCommand(job.data.id));
  }

  @Process(NameQueueConstant.REWARD_QUEUE)
  async handleSettle(job: Job<{ id: number }>): Promise<void> {
    await this.commandBus.execute(new SettleHouseMatchCommand(job.data.id));
  }
}
