import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CombatEngine } from '../../../../combat/domain/combat-engine';
import { PublishedHero } from '../../../../hero-catalog/application/published-hero';
import { GetHeroPairQuery } from '../../../../hero-catalog/application/queries/get-hero-pair/get-hero-pair.query';
import { NameQueueConstant } from '../../../../../shared/constants/name-queue.constant';
import { HouseFighter } from '../../../domain/house-fighter';
import { HouseMatch } from '../../../domain/house-match';
import {
  HOUSE_MATCH_REPOSITORY,
  HouseMatchRepository,
} from '../../../domain/repositories/house-match.repository';
import { freeze } from './freeze-fighter';
import { OpenHouseMatchCommand } from './open-house-match.command';

const REVEAL_DELAY_MS = 2 * 60 * 1000;
const SETTLE_DELAY_MS = 5 * 60 * 1000;

@CommandHandler(OpenHouseMatchCommand)
export class OpenHouseMatchHandler
  implements ICommandHandler<OpenHouseMatchCommand>
{
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(HOUSE_MATCH_REPOSITORY)
    private readonly houseMatches: HouseMatchRepository,
    private readonly combatEngine: CombatEngine,
    @InjectQueue('bet')
    private readonly betQueue: Queue,
    @Inject(EventBus)
    private readonly eventBus: EventBus,
  ) {}

  async execute(): Promise<HouseMatch> {
    const [heroA, heroB] = await this.queryBus.execute<
      GetHeroPairQuery,
      [PublishedHero, PublishedHero]
    >(new GetHeroPairQuery());
    const result = this.combatEngine.simulate(freeze(heroA), freeze(heroB));
    const opened = HouseMatch.open(
      [publicFighter(heroA), publicFighter(heroB)],
      {
        winnerId: result.winnerId,
        loserId: result.loserId,
        turns: JSON.parse(JSON.stringify(result.turns)),
        turnNumber: result.turnNumber,
      },
      Date.now().toString(),
    );
    const saved = await this.houseMatches.open(opened);
    if (!saved.created) {
      return saved.match;
    }

    await this.betQueue.add(
      NameQueueConstant.FIGHT_QUEUE,
      { id: saved.match.id },
      { delay: REVEAL_DELAY_MS },
    );
    await this.betQueue.add(
      NameQueueConstant.REWARD_QUEUE,
      { id: saved.match.id },
      { delay: SETTLE_DELAY_MS },
    );
    this.eventBus.publish(saved.match.bettingOpened());
    return saved.match;
  }
}

function publicFighter(hero: PublishedHero): HouseFighter {
  return {
    id: hero.id,
    name: hero.name,
    element: hero.element,
    position: hero.position,
  };
}
