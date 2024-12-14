import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signup.dto';
import { SignInDto } from './dtos/signin.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthToken } from './decorators/auth-token.decorator';
import {
  AccessAuthTokenPayload,
  RefreshAuthTokenPayload,
} from 'src/common/types/auth';
import { AccessTokenGuard } from './guards/access-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async singup(@Body() singUpDto: SignUpDto) {
    return this.authService.signup(singUpDto);
  }

  @Post('signin')
  async signin(@Body() singInDto: SignInDto) {
    return this.authService.signin(singInDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('signout')
  async signout(@AuthToken() token: AccessAuthTokenPayload) {
    return this.authService.signout(token);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshToken(@AuthToken() refreshToken: RefreshAuthTokenPayload) {
    return this.authService.refreshToken(refreshToken);
  }

  // WARNING: use this endpoit only for testin should be disabled in production
  // @Post('verify/refresh')
  // async verifyRefreshToken(@Body() body: any) {
  //   return this.authService.verifyRefreshToken(body.token);
  // }
}
