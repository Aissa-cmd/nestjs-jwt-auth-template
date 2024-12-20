import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AppUser } from './entities/user.entity';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RequirePermissions } from 'src/authorization/decorators/permission.guard';

@Controller('users')
export class UsersController {
  @UseGuards(AccessTokenGuard)
  @Get('me')
  getUserInfo(@CurrentUser() user: AppUser) {
    return user;
  }

  // NOTE: this is just an example how we use the RequirePermissions guard
  // @RequirePermissions('contents.create')
  // @UseGuards(AccessTokenGuard)
  // @Get('hello')
  // getHello() {
  //   return {
  //     message: 'hello',
  //   };
  // }
}
