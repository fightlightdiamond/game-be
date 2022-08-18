import { Injectable } from '@nestjs/common';
import { BetRepository } from './bet.repository';

@Injectable()
export class BetService {
  constructor(private readonly betRepository: BetRepository) {}

  async bet(body) {
    /**
     * TODO:
     *  - Validate chỉ có thể bet khi Match chưa bắt đầu trận đấu
     *  - Validate số tiền không được quá số tiền hiện có
     */
    return this.betRepository.save(body);
  }
}
