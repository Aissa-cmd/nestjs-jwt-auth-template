import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppAuthTokens } from './entities/auth-token.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/common/types/app-config';
import { AuthTokenTypes, ChainTokenTypes } from 'src/common/enums/auth';
import { AuthHelpers } from 'src/common/utils/auth.helpers';
import { AppUser } from 'src/users/entities/user.entity';
import { AuthTokenPayload, RefreshAuthTokenPayload } from 'src/common/types/auth';

@Injectable()
export class AuthTokensService {
  constructor(
    @InjectRepository(AppAuthTokens)
    private readonly authTokensRepository: Repository<AppAuthTokens>,
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly jwtService: JwtService,
  ) { }

  #getTokenSecret(type: AuthTokenTypes) {
    if (type === AuthTokenTypes.REFRESH) {
      return this.configService.get<string>('JWT_REFRESH_SECRET');
    } else {
      return this.configService.get<string>('JWT_ACCESS_SECRET');
    }
  }

  async createTokenPair(user: AppUser): Promise<{
    access: string;
    refresh: string;
  }> {
    try {
      const refreshTokenDuration = this.configService.get<string>(
        'JWT_REFRESH_DURATION',
      );
      const refreshTokenExpDate = AuthHelpers.getExpDate(refreshTokenDuration);

      const accessTokenDuration = this.configService.get<string>(
        'JWT_ACCESS_DURATION',
      );

      let sessionChain = this.authTokensRepository.create({
        user: user,
        type: ChainTokenTypes.SESSION,
        expiresIn: refreshTokenExpDate,
      });
      let subChain = this.authTokensRepository.create({
        user: user,
        type: ChainTokenTypes.SUB_CHAIN,
        expiresIn: refreshTokenExpDate,
      });
      [sessionChain, subChain] = await this.authTokensRepository.save([
        sessionChain,
        subChain,
      ]);
      const refreshToken = this.jwtService.sign(
        {
          shi: sessionChain.id,
          chi: subChain.id,
          typ: AuthTokenTypes.REFRESH,
        },
        {
          secret: this.#getTokenSecret(AuthTokenTypes.REFRESH),
          expiresIn: refreshTokenDuration,
          subject: user.id,
        },
      );
      const accessToken = this.jwtService.sign(
        {
          shi: sessionChain.id,
          chi: subChain.id,
          typ: AuthTokenTypes.ACCESS,
        },
        {
          secret: this.#getTokenSecret(AuthTokenTypes.ACCESS),
          expiresIn: accessTokenDuration,
          subject: user.id,
        },
      );
      return {
        access: accessToken,
        refresh: refreshToken,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async verifyToken<T extends AuthTokenTypes>(
    token: string,
    type: T,
  ): Promise<AuthTokenPayload<T>> {
    try {
      const validatedPayload = this.jwtService.verify<AuthTokenPayload<T>>(
        token,
        {
          secret: this.#getTokenSecret(type),
        },
      );
      if (validatedPayload.typ !== type) {
        throw new Error('Invalid token type');
      }
      // check that this token subchain or sessionchain is not revoked
      const exists = await this.authTokensRepository.exists({
        where: [
          {
            id: validatedPayload.shi,
            isRevoked: true,
          },
          {
            id: validatedPayload.chi,
            isRevoked: true,
          },
        ],
      });
      if (exists) {
        throw new Error('Invalid token');
      }
      return validatedPayload;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async revokeSessionChain(sessionChainId: string) {
    try {
      await this.authTokensRepository.update({
        id: sessionChainId,
        type: ChainTokenTypes.SESSION,
      }, {
        isRevoked: true,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async revokeSubChain(subChainId: string) {
    try {
      await this.authTokensRepository.update({
        id: subChainId,
        type: ChainTokenTypes.SUB_CHAIN,
      }, {
        isRevoked: true,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async refreshToken(refreshTokenPayload: RefreshAuthTokenPayload): Promise<{
    access: string;
    refresh: string;
  }> {
    try {
      const sessionChainId = refreshTokenPayload.shi;
      const userId = refreshTokenPayload.sub;
      const refreshTokenDuration = this.configService.get<string>(
        'JWT_REFRESH_DURATION',
      );
      const refreshTokenExpDate = AuthHelpers.getExpDate(refreshTokenDuration);

      const accessTokenDuration = this.configService.get<string>(
        'JWT_ACCESS_DURATION',
      );
      let subChain = this.authTokensRepository.create({
        user: {
          id: userId,
        },
        type: ChainTokenTypes.SUB_CHAIN,
        expiresIn: refreshTokenExpDate,
      });
      subChain = await this.authTokensRepository.save(subChain);
      const refreshToken = this.jwtService.sign(
        {
          shi: sessionChainId,
          chi: subChain.id,
          typ: AuthTokenTypes.REFRESH,
        },
        {
          secret: this.#getTokenSecret(AuthTokenTypes.REFRESH),
          expiresIn: refreshTokenDuration,
          subject: userId,
        },
      );
      const accessToken = this.jwtService.sign(
        {
          shi: sessionChainId,
          chi: subChain.id,
          typ: AuthTokenTypes.ACCESS,
        },
        {
          secret: this.#getTokenSecret(AuthTokenTypes.ACCESS),
          expiresIn: accessTokenDuration,
          subject: userId,
        },
      );
      this.revokeSubChain(refreshTokenPayload.chi).catch((error) => {
        console.log(error);
      })
      return {
        access: accessToken,
        refresh: refreshToken,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
