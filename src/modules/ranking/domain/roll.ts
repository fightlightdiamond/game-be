export const ROLL = Symbol('ROLL');

export interface Roll {
  between(min: number, max: number): number;
}
