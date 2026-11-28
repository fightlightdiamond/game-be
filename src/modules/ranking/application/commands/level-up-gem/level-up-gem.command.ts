import { GemType } from '../../../domain/gem';

export class LevelUpGemCommand {
  constructor(
    readonly accountId: number,
    readonly type: GemType,
    readonly level: number,
    readonly spent: number,
  ) {}
}
