import { Module } from '@nestjs/common';
import { SkillRegistry } from './services/skill-registry.service';
import { CombatEngine } from './services/combat-engine.service';

@Module({
  providers: [SkillRegistry, CombatEngine],
  exports: [CombatEngine],
})
export class CombatModule {}
