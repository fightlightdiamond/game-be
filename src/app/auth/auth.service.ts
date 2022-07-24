import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../user/user.repository';
import { UserEntity } from '../user/user.entity';
import { UserInterface } from '../user/user.interface';
import JwtConfig from '../../config/jwt.config';
import { AuthTokenService } from './auth-token/auth-token.service';
import { RegisterReqDto } from './dto/register.req.dto';
import { LoginReqDto } from './dto/login.req.dto';

/**
 * Auth Service
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    private jwtService: JwtService,
    private readonly authTokenService: AuthTokenService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Do User Registration
   * @param registerBody
   */
  async register(registerBody: RegisterReqDto): Promise<UserEntity> {
    const user = new UserEntity();
    user.email = registerBody.email;
    user.password = registerBody.password;
    return user.save();
  }

  /**
   * Login
   * @param user
   */
  login(user: LoginReqDto): Observable<string> {
    const { email, password } = user;
    return this.validateUser(email, password).pipe(
      switchMap((user: UserEntity) => {
        return from(
          this.jwtService.signAsync(
            { user },
            {
              secret: JwtConfig.getConfig(this.config).secret,
            },
          ),
        ).pipe(
          map((jwt) => {
            void this.authTokenService.create({
              userId: user.id,
              token: jwt,
            });
            return jwt;
          }),
        );
      }),
    );
  }

  /**
   * Validate User
   * @param email
   * @param password
   */
  validateUser(email: string, password: string): Observable<UserEntity> {
    return from(
      this.userRepository.findOne({
        select: ['id', 'firstName', 'lastName', 'email', 'password', 'role'],
        where: { email },
      }),
    ).pipe(
      switchMap((user: UserEntity) => {
        if (!user) {
          throw new HttpException(
            { status: HttpStatus.NOT_FOUND, error: 'Invalid Credentials' },
            HttpStatus.NOT_FOUND,
          );
        }
        return from(bcrypt.compare(password, user.password)).pipe(
          map((isValidPassword: boolean) => {
            if (isValidPassword) {
              delete user.password;
              return user;
            }
            throw new HttpException(
              { status: HttpStatus.NOT_FOUND, error: 'Password Incorrect' },
              HttpStatus.NOT_FOUND,
            );
          }),
        );
      }),
    );
  }

  getJwtUser(jwt: string): Observable<UserInterface | null> {
    return from(this.jwtService.verifyAsync(jwt)).pipe(
      map(({ user }: { user: UserInterface }) => {
        return user;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
