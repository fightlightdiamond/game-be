import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NameQueueConstant } from '../../common/constants/name-queue.constant';
import { FightingService } from '../match/fighting.service';
import { RewardService } from '../reward/reward.service';

@Processor('bet')
export class BetConsumer {
  constructor(
    private readonly fightingService: FightingService,
    private readonly rewardService: RewardService,
  ) {}

  @Process(NameQueueConstant.MATCH_QUEUE)
  async match(job: Job) {
    const data = job.data;
    const { id } = data;

    await this.fightingService.execute(id);
  }

  @Process(NameQueueConstant.REWARD_QUEUE)
  async reward(job: Job) {
    const data = job.data;
    const { id } = data;
    await this.rewardService.execute(id);
  }
}
