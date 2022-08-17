import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MESSAGE, REGEX } from '../../user/user.const';

export class LoginReqDto {
  @ApiProperty({
    description: 'The address email',
    example: 'hero@bet-gamex.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password',
    example: 'Hero@123-gamex.com',
  })
  @IsNotEmpty()
  @Length(8, 24)
  @Matches(REGEX.PASSWORD_RULE, {
    message: MESSAGE.PASSWORD_RULE_MESSAGE,
  })
  password: string;
}
