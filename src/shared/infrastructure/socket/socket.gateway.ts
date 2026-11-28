import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { BettingOpened } from '../../../modules/betting/domain/events/betting-opened.event';
import { FightRevealed } from '../../../modules/betting/domain/events/fight-revealed.event';
import { RewardsPaid } from '../../../modules/betting/domain/events/rewards-paid.event';

@WebSocketGateway({ cors: { origin: '*' } })
@EventsHandler(BettingOpened, FightRevealed, RewardsPaid)
@Injectable()
export class SocketGateway
  implements IEventHandler<BettingOpened | FightRevealed | RewardsPaid>
{
  @WebSocketServer()
  server: Server;

  handle(event: BettingOpened | FightRevealed | RewardsPaid): void {
    if (event instanceof BettingOpened) {
      this.server?.to('match').emit('betting', {
        matchId: event.matchId,
        fighters: event.fighters,
        openedAt: event.openedAt,
      });
    } else if (event instanceof FightRevealed) {
      this.server?.to('match').emit('matching', {
        matchId: event.matchId,
        winnerId: event.winnerId,
        turns: event.turns,
        phase: event.phase,
      });
    } else if (event instanceof RewardsPaid) {
      this.server?.to('all').emit('reward', {
        matchId: event.matchId,
        payouts: event.payouts,
      });
    }
  }
}
