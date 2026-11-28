import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MatchCreatedEvent } from '../../../modules/betting/domain/events/match-created.event';
import { FightingStartedEvent } from '../../../modules/betting/domain/events/fighting-started.event';
import { MatchEndedEvent } from '../../../modules/betting/domain/events/match-ended.event';

@WebSocketGateway({ cors: { origin: '*' } })
@EventsHandler(MatchCreatedEvent, FightingStartedEvent, MatchEndedEvent)
@Injectable()
export class SocketGateway
  implements
    IEventHandler<FightingStartedEvent | MatchCreatedEvent | MatchEndedEvent>
{
  @WebSocketServer()
  server: Server;

  handle(
    event: FightingStartedEvent | MatchCreatedEvent | MatchEndedEvent,
  ): void {
    if (event instanceof MatchCreatedEvent) {
      this.server?.to('match').emit('betting', {
        matchId: event.matchId,
        heroInfo: event.heroInfo,
        status: event.status,
        startTime: event.startTime,
      });
    } else if (event instanceof FightingStartedEvent) {
      this.server?.to('match').emit('matching', {
        matchId: event.matchId,
        status: event.status,
      });
    } else if (event instanceof MatchEndedEvent) {
      this.server?.to('all').emit('reward', {
        matchId: event.matchId,
        winnerBets: event.winnerBets,
      });
    }
  }
}
