import type { TokenSchema } from "@/validator/token.validator";
import type { JwtPayload } from "jsonwebtoken";
import type { Moment } from "moment";
import type { z } from "zod";

export interface PayloadType extends JwtPayload {
  sub: string;
  roles: string;
  iat: number;
  exp: number;
  type: string;
}

export type TokenType = z.infer<typeof TokenSchema>;
export type NewTokenType = Omit<TokenType, "id">;
export type TokenQueryType = Partial<TokenType>;

export interface TokenPayloadType {
  token: string;
  expires: Moment;
}

export interface NewPayloadType {
  sub: string;
  roles: string;
  type: string;
  exp: Moment;
}

export interface AccessAndRefreshTokens {
  accessToken: TokenPayloadType;
  refreshToken: TokenPayloadType;
}

export enum TokenTypeEnum {
  ACCESS = "access",
  REFRESH = "refresh",
}
