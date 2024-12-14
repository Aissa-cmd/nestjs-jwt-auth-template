import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUser } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AppAuthTokens } from './entities/auth-token.entity';
import { AuthTokensService } from './tokens.service';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { UsersModule } from 'src/users/users.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppUser, AppAuthTokens]),
    JwtModule.register({
      signOptions: {
        algorithm: 'HS256',
        issuer: 'api.demo.com',
        audience: '.demo.com',
      },
    }),
    PassportModule.register({
      defaultStrategy: 'access-token',
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    AuthTokensService,
    RefreshTokenStrategy,
    AccessTokenStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
