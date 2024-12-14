import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { ChainTokenTypes } from 'src/common/enums/auth';
import { AppUser } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('auth_tokens')
export class AppAuthTokens extends AbstractEntity {
  @Column({ type: 'enum', enum: ChainTokenTypes })
  type: ChainTokenTypes;

  @Column({ type: 'timestamp with time zone' })
  expiresIn: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @ManyToOne(() => AppUser, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn()
  user: AppUser;
}
