import { Request, Response, NextFunction } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "../config/firebase";
import { UserModel } from "../models/user.model";
import { User } from "../types/user.types";
import { userCache, tokenCache } from "../cache/user.cache";

/**
 * Extract Bearer token
 */
type TokenResult = string | { error: string };

const getToken = (request: Request): TokenResult => {
  const header = request.headers.authorization;

  if (!header) return { error: "No token provided" };

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return { error: "Invalid authorization header" };
  }

  return token;
};

/**
 * -----------------------------
 * AUTHENTICATION MIDDLEWARE
 * -----------------------------
 * - Verifies Firebase ID token
 * - Caches decoded token
 * - Attaches request.authUser
 * - Attaches request.cachedUser (if exists)
 */
const authMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getToken(request);

    if (typeof token !== "string") {
      response.status(401).json({ error: token.error });
      return;
    }

    // Token cache
    let decodedToken = tokenCache.get<DecodedIdToken>(token);

    if (!decodedToken) {
      decodedToken = await auth.verifyIdToken(token);
      tokenCache.set(token, decodedToken, 60 * 60); // 1 hour
    }

    request.authUser = decodedToken;

    const uid = decodedToken.uid;

    // User cache
    let user = userCache.get<User>(uid);

    if (!user) {
      user = await UserModel.findOne({ uid }).lean();
      if (user) {
        userCache.set(uid, user);
      }
    }

    request.cachedUser = user ?? undefined;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    response.status(401).json({ error: "Could not authorize" });
  }
};

/**
 * -----------------------------
 * ADMIN AUTHORIZATION MIDDLEWARE
 * -----------------------------
 * - Assumes authMiddleware already ran
 * - Checks admin privileges
 */
 const adminOnlyMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  const user = request.cachedUser;

  if (!user) {
    response.status(404).json({ error: "User not found" });
    return;
  }

  if (!user.isAdmin && !user.isSuperAdmin) {
    response.status(403).json({
      error: "You are not authorized to perform this operation",
    });
    return;
  }

  next();
};

/**
 * -----------------------------
 * HELPERS
 * -----------------------------
 */

 const getAuthUser = async (
  request: Request
): Promise<User | null> => {
  return request.cachedUser ?? null;
};

 const getAuthUserUid = (
  request: Request
): string | null => {
  return request.authUser?.uid ?? null;
};

// ---------- Exports ----------

export {
  authMiddleware,
  getAuthUser,
  getAuthUserUid,
  adminOnlyMiddleware,

};