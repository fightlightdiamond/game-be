import Elo from '@studimax/elo';

export class EloRating {
  private static readonly elo = new Elo({ kFactor: 20 });

  constructor(private readonly value: number) {}

  static initial(): EloRating {
    return new EloRating(1600);
  }

  /**
   * Recalculate ELO rating.
   * @param opponentRating - opponent's current EloRating
   * @param outcome - 1 for win, 0 for loss
   * @returns new EloRating (original is unchanged)
   */
  recalculate(opponentRating: EloRating, outcome: 0 | 1): EloRating {
    const { Ra } = EloRating.elo.calculateRating(
      this.value,
      opponentRating.getValue(),
      outcome,
    );
    return new EloRating(Ra);
  }

  getValue(): number {
    return this.value;
  }
}
