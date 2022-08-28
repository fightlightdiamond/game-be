import { Field, ObjectType } from '@nestjs/graphql';
import { ILoginResDto } from '../dto/login.res.dto';
import { UserEntity } from '../../../migrations/entities/user.entity';

@ObjectType()
export class LoginResponse implements ILoginResDto {
  @Field() token: string;
  @Field() user: UserEntity;
}
