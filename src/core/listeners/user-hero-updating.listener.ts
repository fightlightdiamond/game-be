import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserHeroUpdatingEvent } from '../events/user-hero-updating.event';

@Injectable()
export class UserHeroUpdatingListener {
  @OnEvent(UserHeroUpdatingEvent.name)
  handleOrderCreatedEvent(event: UserHeroUpdatingEvent) {
    // handle and process "OrderCreatedEvent" event
    console.log(event);
  }
}
