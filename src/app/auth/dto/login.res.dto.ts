import { UserEntity } from '../../../migrations/entities/user.entity';

export interface ILoginResDto {
  token: string;
  user: UserEntity;
}
