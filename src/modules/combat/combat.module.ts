import { Module } from '@nestjs/common';
import { CombatEngine } from './domain/combat-engine';
import { MathRandomSource } from './domain/random-source';
import { TraitRegistry } from './domain/traits';

@Module({
  providers: [
    {
      provide: CombatEngine,
      useFactory: () =>
        new CombatEngine(new TraitRegistry(), new MathRandomSource()),
    },
  ],
  exports: [CombatEngine],
})
export class CombatModule {}
