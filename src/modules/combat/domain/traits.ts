import { Fighter } from './fighter';
import { RandomSource } from './random-source';
import { UnknownTraitException } from './unknown-trait.exception';

export interface TraitContext {
  turnNumber: number;
  random: RandomSource;
}

export interface TraitResult {
  attacker: Fighter;
  defender: Fighter;
  active: boolean;
  skillDamage: number;
}

export interface Trait {
  readonly name: string;
  apply(
    attacker: Fighter,
    defender: Fighter,
    context: TraitContext,
  ): TraitResult;
}

function idle(attacker: Fighter, defender: Fighter): TraitResult {
  return { attacker, defender, active: false, skillDamage: 0 };
}

const hell: Trait = {
  name: 'Hell',
  apply(attacker, defender) {
    let nextAttacker = attacker;
    let nextDefender = defender;
    let active = false;

    if (
      attacker.currentHp / attacker.maxHp <= 0.7 &&
      attacker.currentHp < defender.currentHp
    ) {
      active = true;
      nextAttacker = nextAttacker.copy({
        currentAtk:
          nextAttacker.currentAtk +
          Math.round((defender.currentHp - attacker.currentHp) / 10),
      });
    }

    if (defender.currentHp / defender.maxHp <= 0.3) {
      active = true;
      nextDefender = nextDefender.copy({ currentHp: 0 });
    }

    return {
      attacker: nextAttacker,
      defender: nextDefender,
      active,
      skillDamage: 0,
    };
  },
};

const sphinx: Trait = {
  name: 'Sphinx',
  apply(attacker, defender, context) {
    const currentDefLoss = Math.round(
      30 + (defender.currentDef > 0 ? defender.currentDef * 0.1 : 0),
    );
    const baseDefLoss = Math.round(
      attacker.currentAtk * 0.03 +
        (defender.baseDef > 0 ? defender.baseDef * 0.2 : 0),
    );
    let nextAttacker = attacker;
    if (
      context.turnNumber % 2 === 0 &&
      attacker.currentHp < defender.currentHp
    ) {
      nextAttacker = attacker.copy({
        currentAtk: Math.round(attacker.currentAtk * 1.2),
      });
    }
    return {
      attacker: nextAttacker,
      defender: defender.copy({
        currentDef: defender.currentDef - currentDefLoss,
        baseDef: defender.baseDef - baseDefLoss,
      }),
      active: true,
      skillDamage: 0,
    };
  },
};

const valkyrie: Trait = {
  name: 'Valkyrie',
  apply(attacker, defender) {
    const intrinsicStatus =
      attacker.intrinsicStatus < 4
        ? attacker.intrinsicStatus + 1
        : attacker.intrinsicStatus;
    const skillDamage = Math.round(0.02 * intrinsicStatus * defender.maxHp);
    return {
      attacker: attacker.copy({ intrinsicStatus }),
      defender: defender.copy({
        currentHp: defender.currentHp - skillDamage,
      }),
      active: true,
      skillDamage,
    };
  },
};

const hera: Trait = {
  name: 'Hera',
  apply(attacker, defender, context) {
    let nextAttacker = attacker;
    let nextDefender = defender;

    if (defender.intrinsicStatus !== 0 && attacker.intrinsicStatus === 0) {
      nextAttacker = nextAttacker.copy({ intrinsicStatus: 1 });
      nextDefender = nextDefender.copy({
        currentAtk: Math.round(nextDefender.currentAtk * 0.8),
        baseAtk: Math.round(nextDefender.baseAtk * 0.8),
      });
    }

    const roll = context.random.roll(1, 100);
    if (defender.intrinsicStatus === -1 || roll > 30) {
      nextAttacker = nextAttacker.copy({
        critDmg: Math.round(nextAttacker.critDmg * 1.1),
      });
    } else {
      nextAttacker = nextAttacker.copy({
        critRate: nextAttacker.critRate + 5,
        effectResistance: 1,
      });
    }

    return {
      attacker: nextAttacker,
      defender: nextDefender,
      active: true,
      skillDamage: 0,
    };
  },
};

const darklord: Trait = {
  name: 'Darklord',
  apply(attacker, defender) {
    if (attacker.currentHp / attacker.maxHp > 0.6) {
      return idle(attacker, defender);
    }
    return {
      attacker: attacker.copy({
        currentAtk: Math.round(attacker.currentAtk * 1.6),
        currentDef: Math.round(attacker.currentDef * 1.5),
        intrinsicStatus: -1,
      }),
      defender,
      active: true,
      skillDamage: 0,
    };
  },
};

const poseidon: Trait = {
  name: 'Poseidon',
  apply(attacker, defender) {
    if (attacker.intrinsicStatus >= 10) {
      return idle(attacker, defender);
    }
    return {
      attacker: attacker.copy({
        intrinsicStatus: attacker.intrinsicStatus + 1,
        currentAtk: Math.round(attacker.currentAtk * 1.075),
        currentDef: Math.round(attacker.currentDef * 1.02),
      }),
      defender,
      active: true,
      skillDamage: 0,
    };
  },
};

const fenrir: Trait = {
  name: 'Fenrir',
  apply(attacker, defender) {
    return {
      attacker: attacker.copy({
        critRate: attacker.critRate + 5,
        critDmg: attacker.critDmg + 20,
        intrinsicStatus: attacker.intrinsicStatus + 1,
      }),
      defender,
      active: true,
      skillDamage: 0,
    };
  },
};

const chiron: Trait = {
  name: 'Chiron',
  apply(attacker, defender) {
    const lost = attacker.maxHp - attacker.currentHp;
    return {
      attacker: attacker.copy({
        currentAtk: Math.round(
          attacker.baseAtk * (1 + (lost / attacker.maxHp) * 0.85),
        ),
      }),
      defender,
      active: true,
      skillDamage: 0,
    };
  },
};

const phoenix: Trait = {
  name: 'Phoenix',
  apply(attacker, defender) {
    const skillDamage = Math.round(
      (attacker.maxHp - attacker.currentHp) * 0.09,
    );
    return {
      attacker,
      defender: defender.copy({
        currentHp: defender.currentHp - skillDamage,
      }),
      active: true,
      skillDamage,
    };
  },
};

const amon: Trait = {
  name: 'Amon',
  apply(attacker, defender) {
    const healed = attacker.copy({
      intrinsicStatus: attacker.intrinsicStatus + 1,
      currentHp: attacker.currentHp + Math.round(attacker.currentAtk * 0.3),
    });
    const lostAfterHeal = healed.maxHp - healed.currentHp;
    const defLoss = Math.round(
      lostAfterHeal * 0.006 +
        (defender.baseDef > 0 ? defender.baseDef * 0.2 : 0),
    );
    return {
      attacker: healed,
      defender: defender.copy({
        currentDef: defender.currentDef - defLoss,
      }),
      active: true,
      skillDamage: 0,
    };
  },
};

const nezha: Trait = {
  name: 'Nezha',
  apply(attacker, defender, context) {
    const ratio = attacker.currentHp / attacker.maxHp;
    const active = ratio <= 0.5 && context.random.roll(1, 100) <= 50;
    return { attacker, defender, active, skillDamage: 0 };
  },
};

const TRAITS: Trait[] = [
  hell,
  sphinx,
  valkyrie,
  hera,
  darklord,
  poseidon,
  fenrir,
  chiron,
  phoenix,
  amon,
  nezha,
];

export class TraitRegistry {
  private readonly byName = new Map(TRAITS.map((trait) => [trait.name, trait]));

  get(name: string): Trait {
    const trait = this.byName.get(name);
    if (!trait) {
      throw new UnknownTraitException(name);
    }
    return trait;
  }
}
