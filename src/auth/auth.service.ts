import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { SignInDto } from './dtos/signin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AppUser } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthTokensService } from './tokens.service';
import { AuthHelpers } from 'src/common/utils/auth.helpers';
import { AuthTokenTypes } from 'src/common/enums/auth';
import {
  AccessAuthTokenPayload,
  RefreshAuthTokenPayload,
} from 'src/common/types/auth';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AppUser)
    private readonly usersRepository: Repository<AppUser>,
    private readonly authTokensService: AuthTokensService,
  ) {}

  async signup(signUpDto: SignUpDto) {
    try {
      const exisitingUser = await this.usersRepository.findOne({
        where: {
          email: signUpDto.email,
        },
      });
      if (exisitingUser) {
        throw new BadRequestException('Email Already taken');
      }
      const newUser = new AppUser();
      newUser.email = signUpDto.email;
      newUser.password = await AuthHelpers.hashUserPassword(signUpDto.password);
      const savedUser = await this.usersRepository.save(newUser);
      return this.authTokensService.createTokenPair(savedUser);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async signin(signInDto: SignInDto) {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          email: signInDto.email,
        },
      });
      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }
      const isPasswordValid = await AuthHelpers.verifyUserPasswordHash(
        user.password,
        signInDto.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid credentials');
      }
      return this.authTokensService.createTokenPair(user);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async signout(token: AccessAuthTokenPayload) {
    try {
      await this.authTokensService.revokeSessionChain(token.shi);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async refreshToken(refreshToken: RefreshAuthTokenPayload) {
    try {
      return await this.authTokensService.refreshToken(refreshToken);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyRefreshToken(token: string) {
    return this.authTokensService.verifyToken(token, AuthTokenTypes.REFRESH);
  }
}
