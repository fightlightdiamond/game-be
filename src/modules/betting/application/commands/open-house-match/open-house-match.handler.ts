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
import { Fighter } from '../../../../combat/domain/fighter';
import { GetHeroPairQuery } from '../../../../hero-catalog/application/queries/get-hero-pair/get-hero-pair.query';
import { Hero } from '../../../../hero-catalog/domain/aggregates/hero.aggregate';
import { NameQueueConstant } from '../../../../../shared/constants/name-queue.constant';
import { HouseFighter } from '../../../domain/house-fighter';
import { HouseMatch } from '../../../domain/house-match';
import {
  HOUSE_MATCH_REPOSITORY,
  HouseMatchRepository,
} from '../../../domain/repositories/house-match.repository';
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
      [Hero, Hero]
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

function publicFighter(hero: Hero): HouseFighter {
  return {
    id: hero.id,
    name: hero.name,
    element: hero.element,
    position: hero.position,
  };
}

function freeze(hero: Hero): Fighter {
  return new Fighter(
    hero.id,
    hero.name,
    hero.stats.hp,
    hero.stats.hp,
    hero.stats.atk,
    hero.stats.atk,
    hero.stats.def,
    hero.stats.def,
    hero.stats.spd,
    hero.stats.critRate,
    hero.stats.critDmg,
    hero.stats.dodge,
    hero.stats.effectResistance,
    hero.stats.intrinsicStatus,
  );
}
