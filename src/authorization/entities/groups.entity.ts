import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthPermission } from './permission.entity';
import { AppUser } from 'src/users/entities/user.entity';

@Entity('auth_groups')
export class AuthGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => AuthPermission)
  @JoinTable({
    name: 'auth_group_permissions',
  })
  permissions: AuthPermission[];

  @ManyToMany(() => AppUser, (user) => user.groups)
  users: AppUser[];
}
