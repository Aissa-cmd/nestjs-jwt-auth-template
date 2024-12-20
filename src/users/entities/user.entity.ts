import { AuthGroup } from 'src/authorization/entities/groups.entity';
import { AuthPermission } from 'src/authorization/entities/permission.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';

@Entity('users')
export class AppUser extends AbstractEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ManyToMany(() => AuthPermission)
  @JoinTable({
    name: 'user_permissions',
  })
  permissions: AuthPermission[];

  @ManyToMany(() => AuthGroup, (group) => group.users)
  @JoinTable({
    name: 'user_groups',
  })
  groups: AuthGroup[];

  toJSON() {
    delete this.password;
    return this;
  }

  hasPermissions(permissionNames: string[]): boolean {
    const allPermissions = [
      ...(this.permissions?.map((perm) => perm.name) || []),
      ...(this.groups?.flatMap(
        (group) => group.permissions?.map((perm) => perm.name) || [],
      ) || []),
    ];
    return permissionNames.every((permission) =>
      allPermissions.includes(permission),
    );
  }
}
