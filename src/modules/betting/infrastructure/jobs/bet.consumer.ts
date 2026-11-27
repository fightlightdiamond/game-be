import { Process, Processor } from '@nestjs/bull';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bull';
import { ResolveFightingCommand } from '../../application/commands/resolve-fighting/resolve-fighting.command';
import { ResolveRewardCommand } from '../../application/commands/resolve-reward/resolve-reward.command';
import { NameQueueConstant } from '../../../../shared/constants/name-queue.constant';

@Processor('bet')
export class BetConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @Process(NameQueueConstant.FIGHT_QUEUE)
  async handleFight(job: Job<{ id: number }>): Promise<void> {
    await this.commandBus.execute(new ResolveFightingCommand(job.data.id));
  }

  @Process(NameQueueConstant.REWARD_QUEUE)
  async handleReward(job: Job<{ id: number }>): Promise<void> {
    await this.commandBus.execute(new ResolveRewardCommand(job.data.id));
  }
}
