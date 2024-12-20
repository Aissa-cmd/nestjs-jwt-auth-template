import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppUser } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(AppUser)
    private readonly usersRepository: Repository<AppUser>,
  ) {}

  /**
   * This method is used in auth process to get user by id
   * from token payload, and should only be used there
   */
  async findAuthUserById(userId: string) {
    try {
      const user = await this.usersRepository.findOne({
        relations: ['permissions', 'groups', 'groups.permissions'],
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
