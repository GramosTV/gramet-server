import { Roles } from '../enums/roles';

export interface JwtAccessPayload {
  email: string;
  sub: string;
  role: Roles;
}

export interface JwtRefreshPayload {
  email: string;
  sub: string;
  jti: string;
  role: Roles;
}
