export const GEM_TYPES = [
  'HP',
  'ATK',
  'DEF',
  'CRIT_RATE',
  'CRIT_DMG',
  'SPD',
] as const;

export type GemType = typeof GEM_TYPES[number];

export function droppedType(roll: number, typeIndex: number): GemType | null {
  if (roll > 5) {
    return null;
  }
  return GEM_TYPES[typeIndex];
}

export function levelUpGem(
  available: number,
  spent: number,
  roll: number,
): { available: number; gained: boolean } {
  if (spent <= 0 || spent > available) {
    throw new Error('Not enough gems in storage');
  }
  const chance = (spent / 10) * 100;
  return { available: available - spent, gained: roll <= chance };
}
