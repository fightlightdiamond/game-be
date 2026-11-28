import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { GetHeroQuery } from '../../../../hero-catalog/application/queries/get-hero/get-hero.query';
import { Hero } from '../../../../hero-catalog/domain/hero';
import { CombatEngine } from '../../../../combat/domain/combat-engine';
import { Challenge } from '../../../domain/challenge';
import { nextElo } from '../../../domain/elo';
import {
  CHALLENGE_REPOSITORY,
  ChallengeRepository,
} from '../../../domain/repositories/challenge.repository';
import {
  OWNED_HERO_REPOSITORY,
  OwnedHeroRepository,
} from '../../../domain/repositories/owned-hero.repository';
import { ChallengeCommand } from './challenge.command';
import { freezeOwned } from './freeze-fighter';

@CommandHandler(ChallengeCommand)
export class ChallengeHandler implements ICommandHandler<ChallengeCommand> {
  constructor(
    @Inject(OWNED_HERO_REPOSITORY)
    private readonly ownedHeroes: OwnedHeroRepository,
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challenges: ChallengeRepository,
    private readonly combatEngine: CombatEngine,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: ChallengeCommand): Promise<Challenge> {
    const home = await this.ownedHeroes.findByAccountId(command.accountId);
    if (!home) {
      throw new HttpException(
        'Challenger hero not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const away = await this.ownedHeroes.findById(command.competitorId);
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

    await this.ownedHeroes.save(home);
    await this.ownedHeroes.save(away);

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
      command.accountId,
    );

    return this.challenges.save(challenge);
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
