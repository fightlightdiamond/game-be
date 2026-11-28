import { Roll } from '../domain/roll';

export class MathRoll implements Roll {
  between(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
  }
}
