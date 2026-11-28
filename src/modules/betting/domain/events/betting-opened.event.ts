import { HouseFighter } from '../house-fighter';

export class BettingOpened {
  constructor(
    readonly matchId: number,
    readonly fighters: HouseFighter[],
    readonly openedAt: string,
  ) {}
}
