import { DecodedIdToken } from "firebase-admin/auth";
import { User } from "./user.types";


declare global {
  namespace Express {
    interface Request {
      authUser?: DecodedIdToken;
      cachedUser?: User
    }
  }
}

export {};
