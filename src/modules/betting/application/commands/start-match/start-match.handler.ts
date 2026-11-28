import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BettingMatch } from '../../../domain/aggregates/betting-match.aggregate';
import {
  BETTING_MATCH_REPOSITORY,
  IBettingMatchRepository,
} from '../../../domain/repositories/betting-match.repository.interface';
import { CombatEngine } from '../../../../combat/domain/combat-engine';
import { Fighter } from '../../../../combat/domain/fighter';
import { GetHeroPairQuery } from '../../../../hero-catalog/application/queries/get-hero-pair/get-hero-pair.query';
import { Hero } from '../../../../hero-catalog/domain/aggregates/hero.aggregate';
import { NameQueueConstant } from '../../../../../shared/constants/name-queue.constant';
import { StartMatchCommand } from './start-match.command';

@CommandHandler(StartMatchCommand)
export class StartMatchHandler implements ICommandHandler<StartMatchCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(BETTING_MATCH_REPOSITORY)
    private readonly bettingMatchRepository: IBettingMatchRepository,
    private readonly combatEngine: CombatEngine,
    @InjectQueue('bet')
    private readonly betQueue: Queue,
    @Inject(EventBus)
    private readonly eventBus: EventBus,
  ) {}

  async execute(): Promise<BettingMatch> {
    // 1. Get a pair of heroes
    const [heroA, heroB] = await this.queryBus.execute<
      GetHeroPairQuery,
      [Hero, Hero]
    >(new GetHeroPairQuery());

    const home = freeze(heroA);
    const away = freeze(heroB);
    const result = this.combatEngine.simulate(home, away);

    // 4. Build heroInfo
    const heroInfo: Array<Record<string, unknown>> = [
      {
        id: heroA.id,
        name: heroA.name,
        element: heroA.element,
        position: heroA.position,
      },
      {
        id: heroB.id,
        name: heroB.name,
        element: heroB.element,
        position: heroB.position,
      },
    ];

    // 5. Serialize turns to plain objects
    const plainTurns: Array<Record<string, unknown>> = JSON.parse(
      JSON.stringify(result.turns),
    );

    // 6. Create and start betting on the match
    const match = BettingMatch.create(
      0,
      heroInfo,
      result.winnerId,
      result.loserId,
      plainTurns,
      result.turnNumber,
    );
    match.startBetting();

    // 7. Persist the match
    const savedMatch = await this.bettingMatchRepository.save(match);

    // 8. Schedule Bull jobs for state transitions
    await this.betQueue.add(
      NameQueueConstant.FIGHT_QUEUE,
      { id: savedMatch.id },
      { delay: 60_000 },
    );
    await this.betQueue.add(
      NameQueueConstant.REWARD_QUEUE,
      { id: savedMatch.id },
      { delay: 180_000 },
    );

    // 9. Publish domain events
    savedMatch.publish(this.eventBus);

    return savedMatch;
  }
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
