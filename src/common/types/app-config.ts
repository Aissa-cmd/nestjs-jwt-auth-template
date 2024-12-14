export interface AppConfig {
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: number;
  DATABASE_HOST: string;
  DATABASE_PORT: string;
  DATABASE_NAME: string;

  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_DURATION: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_DURATION: string;
}
