import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LEDGER, Ledger } from '../../../../ledger/domain/ledger';
import { CLOCK, Clock } from '../../../domain/clock';
import { GRANTED_DAY, GrantedDay } from '../../../domain/granted-day';
import { calendarDay, GRANT_AMOUNT } from '../../../domain/login-grant';
import {
  ACCOUNT_REPOSITORY,
  AccountRepository,
} from '../../../domain/repositories/account.repository';
import { PasswordHasher } from '../../../infrastructure/auth/password-hasher';
import { OpenBalance } from '../../../infrastructure/open-balance';
import { LoginCommand } from './login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accounts: AccountRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(CLOCK)
    private readonly clock: Clock,
    @Inject(GRANTED_DAY)
    private readonly grantedDays: GrantedDay,
    @Inject(LEDGER)
    private readonly ledger: Ledger,
    private readonly balances: OpenBalance,
  ) {}

  async execute(command: LoginCommand): Promise<{ token: string }> {
    const account = await this.accounts.findByEmail(command.email);
    if (!account) {
      throw new HttpException('Invalid credentials', HttpStatus.NOT_FOUND);
    }
    const valid = await this.passwordHasher.compare(
      command.password,
      account.getPasswordHash(),
    );
    if (!valid) {
      throw new HttpException('Password incorrect', HttpStatus.UNAUTHORIZED);
    }

    await this.grant(account.id);

    const token = await this.jwtService.signAsync(
      {
        user: {
          id: account.id,
          email: account.getEmail(),
          role: account.role,
        },
      },
      { secret: this.config.get<string>('JWT_SECRET') },
    );
    return { token };
  }

  private async grant(accountId: number): Promise<void> {
    const today = calendarDay(this.clock.now());
    const claimed = await this.grantedDays.claim(accountId, today);
    if (!claimed) {
      return;
    }
    try {
      await this.balances.openIfMissing(accountId);
      await this.ledger.credit(accountId, GRANT_AMOUNT);
    } catch (error) {
      await this.grantedDays.release(accountId, today);
      throw error;
    }
  }
}
