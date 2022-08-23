import { Field, ObjectType } from '@nestjs/graphql';
import { ILoginResDto } from '../dto/login.res.dto';

@ObjectType()
export class LoginResponse implements ILoginResDto {
  @Field() token: string;
  @Field() balance: number;
  @Field() email: string;
  @Field() id: number;
}
