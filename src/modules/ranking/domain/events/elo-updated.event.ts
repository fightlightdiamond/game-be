export class EloUpdatedEvent {
  constructor(
    public readonly userHeroId: number,
    public readonly newRating: number,
  ) {}
}
