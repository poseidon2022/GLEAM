import type { UserRole } from "@/entities/user.entity";
import type { ReqUserType, UserWithTokens } from "@/types";
import type { PayloadType } from "./token.types";

declare global {
  namespace Express {
    interface Request {
      user?: ReqUserType;
      token?: PayloadType;
      role?: UserRole;
    }
  }
}
