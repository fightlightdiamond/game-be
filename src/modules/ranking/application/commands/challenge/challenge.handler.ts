import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { GetHeroQuery } from '../../../../hero-catalog/application/queries/get-hero/get-hero.query';
import { Hero } from '../../../../hero-catalog/domain/hero';
import { CombatEngine } from '../../../../combat/domain/combat-engine';
import { Challenge } from '../../../domain/challenge';
import { nextElo } from '../../../domain/elo';
import {
  ELO_MATCH_REPOSITORY,
  IEloMatchRepository,
} from '../../../domain/repositories/elo-match.repository.interface';
import {
  USER_HERO_REPOSITORY,
  IUserHeroRepository,
} from '../../../domain/repositories/user-hero.repository.interface';
import { ChallengeCommand } from './challenge.command';
import { freezeOwned } from './freeze-fighter';

@CommandHandler(ChallengeCommand)
export class ChallengeHandler implements ICommandHandler<ChallengeCommand> {
  constructor(
    @Inject(USER_HERO_REPOSITORY)
    private readonly userHeroRepo: IUserHeroRepository,
    @Inject(ELO_MATCH_REPOSITORY)
    private readonly eloMatchRepo: IEloMatchRepository,
    private readonly combatEngine: CombatEngine,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: ChallengeCommand): Promise<Challenge> {
    // 1. Load challenger's UserHero
    const home = await this.userHeroRepo.findByUserId(command.userId);
    if (!home) {
      throw new HttpException(
        'Challenger hero not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // 2. Load competitor's UserHero
    const away = await this.userHeroRepo.findById(command.competitorId);
    if (!away) {
      throw new HttpException(
        'Competitor hero not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const homeHero = await this.catalogHero(home.heroId);
    const awayHero = await this.catalogHero(away.heroId);
    const homeFighter = freezeOwned(home.id, home, homeHero);
    const awayFighter = freezeOwned(away.id, away, awayHero);
    const result = this.combatEngine.simulate(homeFighter, awayFighter);

    const homeOutcome: 0 | 1 = result.winnerId === home.id ? 1 : 0;
    const awayOutcome: 0 | 1 = homeOutcome === 1 ? 0 : 1;
    home.setElo(nextElo(home.elo, away.elo, homeOutcome));
    away.setElo(nextElo(away.elo, home.elo, awayOutcome));

    await this.userHeroRepo.save(home);
    await this.userHeroRepo.save(away);

    // 9. Build heroInfo and plain turns, then persist EloMatch
    const heroInfo = [
      { id: home.id, heroId: home.heroId },
      { id: away.id, heroId: away.heroId },
    ];

    const plainTurns = result.turns.map((t) => ({
      turnNumber: t.turnNumber,
      attackerId: t.attackerId,
      defenderId: t.defenderId,
      damage: t.damage,
      skillDamage: t.skillDamage,
      attackerHpAfter: t.attackerHpAfter,
      defenderHpAfter: t.defenderHpAfter,
      isCrit: t.isCrit,
      isActiveSkill: t.isActiveSkill,
    }));

    const challenge = Challenge.create(
      heroInfo,
      plainTurns,
      result.turnNumber,
      result.winnerId,
      result.loserId,
      command.userId,
    );

    return this.eloMatchRepo.save(challenge);
  }

  private async catalogHero(heroId: number): Promise<Hero> {
    const hero = await this.queryBus.execute<GetHeroQuery, Hero | null>(
      new GetHeroQuery(heroId),
    );
    if (!hero) {
      throw new HttpException(
        `Catalog hero ${heroId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return hero;
  }
}
