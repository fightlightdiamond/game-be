import { define } from 'typeorm-seeding';
import { randEmail, randFirstName, randLastName } from '@ngneat/falso';
import { UserEntity } from '../entities/user.entity';

define(UserEntity, () => {
  const u = new UserEntity();
  u.email = randEmail();
  u.firstName = randFirstName();
  u.lastName = randLastName();
  u.password = '123456';
  return u;
});
