import { GemType } from '../gem';

export const GEM_REPOSITORY = Symbol('GEM_REPOSITORY');

export interface GemRepository {
  addLevelOne(accountId: number, type: GemType): Promise<void>;
  levelUp(
    accountId: number,
    type: GemType,
    level: number,
    spent: number,
    roll: number,
  ): Promise<{ gained: boolean }>;
}
