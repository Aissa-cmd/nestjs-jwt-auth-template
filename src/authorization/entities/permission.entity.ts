import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth_permissions')
export class AuthPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
