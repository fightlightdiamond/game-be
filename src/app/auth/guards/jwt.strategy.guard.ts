import { Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthTokenService } from '../auth-token/auth-token.service';

/**
 * Jwt Strategy
 */
@Injectable()
export class JwtAuthGuard extends PassportStrategy(Strategy) {
  /**
   * @param config
   * @param authTokenService
   */
  constructor(
    config: ConfigService,
    private readonly authTokenService: AuthTokenService, // private context: ExecutionContext,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // algorithms: ['HS256'],
      secretOrKey: config.get<string>('JWT_SECRET'),
      // secretOrPrivateKey: config.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  /**
   * validate
   * @param req
   * @param payload
   */
  async validate(@Request() req, payload) {
    console.log({ payload });
    const { user } = payload;
    const bearerToken = req.header('authorization');
    const token = bearerToken.replace('Bearer ', '');
    const authToken = await this.authTokenService.find({
      token,
      userId: user.id,
    });
    if (!authToken) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
