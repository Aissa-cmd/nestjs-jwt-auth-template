import { AuthTokenTypes } from '../enums/auth';

export interface BaseAuthTokenPayload {
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  sub: string;
  /**
   * sub chain id
   */
  chi: string;
  /**
   * session chain id
   */
  shi: string;
  typ: AuthTokenTypes;
}

export interface RefreshAuthTokenPayload extends BaseAuthTokenPayload {
  typ: AuthTokenTypes.REFRESH;
}

export interface AccessAuthTokenPayload extends BaseAuthTokenPayload {
  typ: AuthTokenTypes.ACCESS;
}

type AuthTokenPayloadMap = {
  [AuthTokenTypes.REFRESH]: RefreshAuthTokenPayload;
  [AuthTokenTypes.ACCESS]: AccessAuthTokenPayload;
};

export type AuthTokenPayload<T extends AuthTokenTypes> = AuthTokenPayloadMap[T];
