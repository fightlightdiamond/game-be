import { Controller, Get, Param, Post } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get(':key/:field')
  async get(@Param('key') key: string, @Param('field') field: string) {
    return this.getHashField(key, field);
  }

  @Post(':key/:field/:value')
  async set(
    @Param('key') key: string,
    @Param('field') field: string,
    @Param('value') value: string,
  ) {
    return this.setHashField(key, field, value);
  }

  async setHashField(key: string, field: string, value: any): Promise<void> {
    const client = this.redisService.getClient();
    await client.hset(key, field, JSON.stringify(value));
  }

  async getHashField(key: string, field: string): Promise<any | null> {
    const client = this.redisService.getClient();
    const result = await client.hget(key, field);
    return result ? JSON.parse(result) : null;
  }

  async clearHashData(key: string, field: string) {
    const client = this.redisService.getClient();
    await client.hdel(key, field); // Xóa trường cụ thể trong hash
  }

  // Nếu bạn muốn xóa toàn bộ hash, bạn có thể sử dụng hdel với danh sách các trường cần xóa
  async clearWholeHash(key: string) {
    const client = this.redisService.getClient();
    await client.del(key);
    const allFields = await client.hkeys(key);
    if (allFields.length > 0) {
      await client.hdel(key, ...allFields);
    }
  }

  async clearAllData() {
    const client = this.redisService.getClient();
    await client.flushall(); // Xóa hết dữ liệu trong tất cả các cơ sở dữ liệu
  }
}
