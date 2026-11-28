import { readFileSync } from 'fs';
import { GEM_TYPES, droppedType, levelUpGem } from './gem';

describe('gem', () => {
  it('drops a level-1 type only when the roll is at most 5', () => {
    expect(droppedType(5, 0)).toBe('HP');
    expect(droppedType(6, 0)).toBeNull();
    expect(GEM_TYPES).toEqual([
      'HP',
      'ATK',
      'DEF',
      'CRIT_RATE',
      'CRIT_DMG',
      'SPD',
    ]);
    expect(droppedType(1, 5)).toBe('SPD');
  });

  it('removes the spent gems whether or not the next level is gained', () => {
    expect(levelUpGem(10, 10, 50)).toEqual({ available: 0, gained: true });
    expect(levelUpGem(10, 5, 51)).toEqual({ available: 5, gained: false });
    expect(levelUpGem(10, 5, 50)).toEqual({ available: 5, gained: true });
  });

  it('does not change storage when there are not enough gems', () => {
    expect(() => levelUpGem(4, 5, 1)).toThrow('Not enough gems in storage');
  });

  it('is not called from settle', () => {
    const handler = readFileSync(
      'src/modules/betting/application/commands/settle-house-match/settle-house-match.handler.ts',
      'utf8',
    );
    const statements = readFileSync(
      'src/modules/betting/infrastructure/persistence/typeorm/house-match.statements.ts',
      'utf8',
    );
    expect(handler + statements).not.toMatch(
      /FROM gems|INTO gems|droppedType|DropGem/,
    );
  });
});
