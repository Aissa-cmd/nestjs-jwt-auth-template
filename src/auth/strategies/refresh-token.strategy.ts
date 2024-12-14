import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from 'src/common/types/app-config';
import type { Request } from 'express';
import { isEmpty } from 'class-validator';
import { AuthTokensService } from '../tokens.service';
import { UsersService } from 'src/users/users.service';
import { AuthTokenTypes } from 'src/common/enums/auth';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly authTokensService: AuthTokensService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
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
        AuthTokenTypes.REFRESH,
      );
      request['__custom'] = {
        token: payload,
      };
      const user = await this.usersService.findAuthUserById(payload.sub);
      return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
