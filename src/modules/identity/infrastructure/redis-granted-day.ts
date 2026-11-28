import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import { GrantedDay } from '../domain/granted-day';

const CLAIM = `
local current = redis.call('GET', KEYS[1])
if current == ARGV[1] then
  return 0
end
redis.call('SET', KEYS[1], ARGV[1])
return 1
`;

@Injectable()
export class RedisGrantedDay implements GrantedDay {
  constructor(private readonly redis: RedisService) {}

  async claim(accountId: number, day: string): Promise<boolean> {
    const result = await this.redis
      .getClient()
      .eval(CLAIM, 1, key(accountId), day);
    return Number(result) === 1;
  }

  async release(accountId: number, day: string): Promise<void> {
    const client = this.redis.getClient();
    const current = await client.get(key(accountId));
    if (current === day) {
      await client.del(key(accountId));
    }
  }
}

function key(accountId: number): string {
  return `login-grant:${accountId}`;
}
