import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AppUser } from './entities/user.entity';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('users')
export class UsersController {
  @UseGuards(AccessTokenGuard)
  @Get('me')
  getUserInfo(@CurrentUser() user: AppUser) {
    return user;
  }
}
