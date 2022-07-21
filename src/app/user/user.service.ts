import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable } from 'rxjs';
import { UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';

import { ConfigService } from '@nestjs/config';
import { SignupInput } from '../auth/input/signup.input';
import { ErrorResponse } from '../auth/shared/errorResponse';
import { LoginInput } from '../auth/input/login.input';
import { RegisterReqDto } from '../auth/dto/register.req.dto';
import { ConfirmEmailService } from './email/confirm-email.service';
import { UserInterface } from './user.interface';
import { UserRepository } from './user.repository';
import { UserEntity } from './user.entity';

@Injectable()
/**
 * User Service
 */
export class UserService {
  /**
   * @param userRepository
   * @param confirmEmailService
   * @param jwtService
   * @param cacheManager
   * @param config
   */
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    private confirmEmailService: ConfirmEmailService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly config: ConfigService,
  ) {}

  /**
   * Do User Registration
   * @param registerBody
   */
  async doUserRegistration(registerBody: RegisterReqDto): Promise<UserEntity> {
    const user = new UserEntity();
    user.email = registerBody.email;
    user.password = registerBody.password;
    return user.save();
  }

  /**
   *
   * @param signupInput
   */
  async signup(signupInput: SignupInput): Promise<ErrorResponse[] | null> {
    const userExit = await this.userRepository.findOne({
      where: { email: signupInput.email },
    });
    if (userExit) {
      return [
        {
          path: 'email',
          message: 'invalid email',
        },
      ];
    }
    const user = new UserEntity();
    user.email = signupInput.email;
    user.password = signupInput.password;
    await user.save();
    await this.confirmEmailService.sent(user.id);

    return null;
  }

  async login(loginInput: LoginInput): Promise<ErrorResponse[] | string> {
    const user = await this.userRepository.findOne({
      where: { email: loginInput.email },
    });
    if (!user) {
      return [
        {
          path: 'email',
          message: 'invalid email',
        },
      ];
    }

    const checkPassword = await bcrypt.compare(
      loginInput.password,
      user.password,
    );

    console.log({ checkPassword });

    if (!checkPassword) {
      return [
        {
          path: 'password',
          message: 'Password invalid',
        },
      ];
    }

    const jwt = this.jwtService.sign(
      { user },
      {
        secret: this.config.get<string>('JWT_SECRET'),
      },
    );

    return [
      {
        path: 'password',
        message: jwt,
      },
    ];
  }

  /**
   * Find User By Id
   * @param id
   */
  findUserById(id: number) {
    return from(
      this.userRepository.findOne({ where: { id }, relations: ['posts'] }),
    ).pipe(
      map((user: UserEntity) => {
        delete user.password;
        return user;
      }),
    );
  }

  /**
   * Update User Image By Id
   * @param id
   * @param imagePath
   */
  updateUserImageById(id: number, imagePath: string): Observable<UpdateResult> {
    const user: UserEntity = new UserEntity();
    user.id = id;
    user.imagePath = imagePath;
    return from(this.userRepository.update(id, user));
  }

  /**
   * Find Image Name By User Id
   * @param id
   */
  findImageNameByUserid(id: number): Observable<string> {
    return from(this.userRepository.findOne({ where: { id } })).pipe(
      map((user) => {
        return user.imagePath;
      }),
    );
  }

  /**
   * Get User By Email
   * @param email
   */
  async getUserByEmail(email: string): Promise<UserInterface> {
    return this.userRepository.getUserByEmail(email);
  }

  async confirmEmail(id: string) {
    const userId = await this.cacheManager.get(id);
    if (!userId) {
      throw new NotFoundException();
    }

    if (typeof userId === 'string') {
      await this.userRepository.update(
        { id: parseInt(userId) },
        { confirmed: true },
      );
    }
    await this.cacheManager.del(id);

    return '0k';
  }

  /**
   * Upload file AWS
   * @param id
   */
  async getById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    } else {
      return user;
    }
  }
}
