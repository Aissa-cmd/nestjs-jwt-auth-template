import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from 'src/common/types/app-config';
import { AuthTokensService } from '../tokens.service';
import { UsersService } from 'src/users/users.service';
import { isEmpty } from 'class-validator';
import { AuthTokenTypes } from 'src/common/enums/auth';
import type { Request } from 'express';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly authTokensService: AuthTokensService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request) {
    try {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
      if (isEmpty(token)) {
        throw new UnauthorizedException();
      }
      const payload = await this.authTokensService.verifyToken(
        token,
        AuthTokenTypes.ACCESS,
      );
      request['__custom'] = {
        token: payload,
      };
      const user = await this.userService.findAuthUserById(payload.sub);
      return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
