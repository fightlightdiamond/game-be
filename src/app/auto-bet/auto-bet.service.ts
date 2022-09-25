import { HttpException, Injectable } from '@nestjs/common';
import { HeroRepository } from '../hero/hero.repository';
import { AutoBetRepository } from './auto-bet.repository';

@Injectable()
export class AutoBetService {
  constructor(
    private readonly autoBetRepository: AutoBetRepository,
    private readonly heroRepository: HeroRepository,
  ) {}

  /**
   * Get Owner
   * @param user_id
   */
  async getOwner(user_id) {
    return this.autoBetRepository.find({
      where: {
        user_id,
      },
    });
  }

  /**
   * get Auto Enable
   * @param rival_pair
   */
  async getAutoEnable(rival_pair: string) {
    return this.autoBetRepository.getEnableByPair(rival_pair);
  }

  /**
   * create Bet
   * @param user_id
   */
  async createBet(user_id: number) {
    const autoBetCheck = await this.autoBetRepository.findOne({
      where: {
        user_id,
      },
    });

    if (autoBetCheck) {
      throw new HttpException('You hand auto bet', 419);
    }

    const heroIds = await this.heroRepository.getIds();
    let k = 1;
    const autoBets: object[] = [];

    for (const item of heroIds) {
      for (let j = k; j < heroIds.length; j++) {
        autoBets.push({
          user_id,
          rival_pair: item.id + '|' + heroIds[j].id,
        });
      }
      k++;
    }

    return this.autoBetRepository.insert(autoBets);
  }

  /**
   * update
   * @param id
   * @param body
   */
  async update(id: number, body: any) {
    return this.autoBetRepository.update(
      {
        id,
      },
      body,
    );
  }
}
