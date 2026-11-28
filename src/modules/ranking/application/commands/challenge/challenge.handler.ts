import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import {
  USER_HERO_REPOSITORY,
  IUserHeroRepository,
} from '../../../domain/repositories/user-hero.repository.interface';
import {
  ELO_MATCH_REPOSITORY,
  IEloMatchRepository,
} from '../../../domain/repositories/elo-match.repository.interface';
import { CombatEngine } from '../../../../combat/services/combat-engine.service';
import { HeroSnapshot } from '../../../../combat/domain/value-objects/hero-snapshot.vo';
import { EloMatch } from '../../../domain/entities/elo-match.entity';
import { ChallengeCommand } from './challenge.command';

@CommandHandler(ChallengeCommand)
export class ChallengeHandler implements ICommandHandler<ChallengeCommand> {
  constructor(
    @Inject(USER_HERO_REPOSITORY)
    private readonly userHeroRepo: IUserHeroRepository,
    @Inject(ELO_MATCH_REPOSITORY)
    private readonly eloMatchRepo: IEloMatchRepository,
    private readonly combatEngine: CombatEngine,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ChallengeCommand): Promise<EloMatch> {
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

    // 3. Build HeroSnapshots (use 0 defaults for fields not tracked on UserHero)
    const homeSnapshot = new HeroSnapshot(
      home.id,
      String(home.heroId),
      home.hp,
      home.atk,
      home.def,
      home.spd,
      home.critRate,
      0, // critDmg
      0, // atkHealing
      0, // takeDmgHealing
      0, // dodge
      0, // acc
      0, // cc
      0, // effectResistance
      0, // intrinsicStatus
    );

    const awaySnapshot = new HeroSnapshot(
      away.id,
      String(away.heroId),
      away.hp,
      away.atk,
      away.def,
      away.spd,
      away.critRate,
      0, // critDmg
      0, // atkHealing
      0, // takeDmgHealing
      0, // dodge
      0, // acc
      0, // cc
      0, // effectResistance
      0, // intrinsicStatus
    );

    // 4. Run combat simulation
    const result = this.combatEngine.simulate(homeSnapshot, awaySnapshot);

    // 5. Determine outcome for home hero
    const homeOutcome: 0 | 1 = result.winnerId === home.id ? 1 : 0;

    // 6. Calculate new ELO ratings
    const newHomeRating = home.eloRating.recalculate(
      away.eloRating,
      homeOutcome,
    );
    const newAwayRating = away.eloRating.recalculate(
      home.eloRating,
      homeOutcome === 1 ? 0 : 1,
    );

    // 7. Apply ELO results to both aggregates
    home.applyEloResult(newHomeRating);
    away.applyEloResult(newAwayRating);

    // 8. Persist both updated UserHero aggregates
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

    const eloMatch = EloMatch.create(
      heroInfo,
      plainTurns,
      result.turnNumber,
      result.winnerId,
      result.loserId,
      command.userId,
    );

    const savedMatch = await this.eloMatchRepo.save(eloMatch);

    // 10. Publish domain events from both aggregates
    this.eventBus.publishAll(home.getUncommittedEvents());
    home.commit();
    this.eventBus.publishAll(away.getUncommittedEvents());
    away.commit();

    return savedMatch;
  }
}
