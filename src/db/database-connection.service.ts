import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConnectionService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const NODE_ENV = this.configService.get<string>('NODE_ENV');
    return {
      name: 'default',
      type: 'postgres',
      host: this.configService.get<string>('DATABASE_HOST'),
      port: Number(this.configService.get<string>('TYPEORM_PORT')),
      username: this.configService.get<string>('DATABASE_USERNAME'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),

      synchronize: true,
      dropSchema: false,
      logging: ['error', 'warn'],
      autoLoadEntities: true,

      entities: [
        `${NODE_ENV === 'test' ? 'src' : 'dist'}/**/**.entity{.ts,.js}`,
      ],
    };
  }
}
