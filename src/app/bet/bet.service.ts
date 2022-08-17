import { Injectable } from '@nestjs/common';
import { BetRepository } from './bet.repository';

@Injectable()
export class BetService {
  constructor(private readonly matchRepository: BetRepository) {}
}
