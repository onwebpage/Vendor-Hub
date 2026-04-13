import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET =
  process.env.JWT_SECRET || "vendorkart-dev-secret-please-set-jwt-secret-in-production";

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set — using insecure dev default. Set JWT_SECRET in production.");
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    (req as any).userId = user.id;
    (req as any).user = user;
    (req as any).userRole = user.role;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = (req as any).userRole;
    if (!roles.includes(role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    (async () => {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, payload.userId))
          .limit(1);
        if (user) {
          (req as any).userId = user.id;
          (req as any).user = user;
          (req as any).userRole = user.role;
        }
      } catch {
      } finally {
        next();
      }
    })();
  } else {
    next();
  }
}
