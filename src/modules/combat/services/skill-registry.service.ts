import { Injectable } from '@nestjs/common';
import { SkillStrategy } from '../domain/skills/skill.strategy.interface';
import { UnknownHeroSkillException } from '../domain/exceptions/unknown-hero-skill.exception';
import { HellSkill } from '../domain/skills/hell.skill';
import { SphinxSkill } from '../domain/skills/sphinx.skill';
import { DarklordSkill } from '../domain/skills/darklord.skill';
import { ValkyrieSkill } from '../domain/skills/valkyrie.skill';
import { PoseidonSkill } from '../domain/skills/poseidon.skill';
import { PhoenixSkill } from '../domain/skills/phoenix.skill';
import { ChironSkill } from '../domain/skills/chiron.skill';
import { HeraSkill } from '../domain/skills/hera.skill';
import { FenrirSkill } from '../domain/skills/fenrir.skill';
import { AmonSkill } from '../domain/skills/amon.skill';
import { NezhaSkill } from '../domain/skills/nezha.skill';

@Injectable()
export class SkillRegistry {
  private readonly registry: Map<string, SkillStrategy>;

  constructor() {
    this.registry = new Map<string, SkillStrategy>([
      ['Hell', new HellSkill()],
      ['Sphinx', new SphinxSkill()],
      ['Darklord', new DarklordSkill()],
      ['Valkyrie', new ValkyrieSkill()],
      ['Poseidon', new PoseidonSkill()],
      ['Phoenix', new PhoenixSkill()],
      ['Chiron', new ChironSkill()],
      ['Hera', new HeraSkill()],
      ['Fenrir', new FenrirSkill()],
      ['Amon', new AmonSkill()],
      ['Nezha', new NezhaSkill()],
    ]);
  }

  get(heroName: string): SkillStrategy {
    const skill = this.registry.get(heroName);
    if (!skill) {
      throw new UnknownHeroSkillException(heroName);
    }
    return skill;
  }
}
