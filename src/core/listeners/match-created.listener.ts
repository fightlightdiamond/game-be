import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MatchCreatedEvent } from '../events/match-created.event';
import { AutoBetService } from '../../app/auto-bet/auto-bet.service';
import { BetService } from '../../app/bet/bet.service';

@Injectable()
export class MatchCreatedListener {
  constructor(
    private readonly autoBetService: AutoBetService,
    private readonly betService: BetService,
  ) {}

  @OnEvent('match.created')
  async handleOrderCreatedEvent(event: MatchCreatedEvent) {
    const { id, winner, loser } = event;

    const rival_pair =
      winner < loser ? `${winner}|${loser}` : `${loser}|${winner}`;

    // const preAutoBetData = {
    //   match_id: id,
    //   rival_pair,
    // };

    const autos = await this.autoBetService.getAutoEnable(rival_pair);

    for (const auto of autos) {
      void this.betService.bet({
        match_id: id,
        user_id: auto.user_id,
        hero_id: auto.hero_id,
        balance: auto.bet_percentage,
      });
    }

    // handle and process "OrderCreatedEvent" event
    console.log(event);
  }
}
