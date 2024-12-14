import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Entity, Column } from 'typeorm';

@Entity('users')
export class AppUser extends AbstractEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  toJSON() {
    delete this.password;
    return this;
  }
}
