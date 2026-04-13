import { Router, Request, Response, NextFunction } from "express";
import { createClerkClient } from "@clerk/backend";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

if (!process.env.CLERK_SECRET_KEY) {
  console.warn("CLERK_SECRET_KEY is not set! Authentication will fail.");
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = await clerkClient.verifyToken(token);
    const clerkUserId = payload.sub;
    
    // Fetch user from DB to get their role
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
    
    (req as any).userId = clerkUserId;
    (req as any).clerkUserId = clerkUserId;
    (req as any).user = user;
    (req as any).userRole = user?.role || "customer";
    
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid token" });
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

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    clerkClient.verifyToken(token)
      .then(async payload => {
        const clerkUserId = payload.sub;
        const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
        
        (req as any).userId = clerkUserId;
        (req as any).clerkUserId = clerkUserId;
        (req as any).user = user;
        (req as any).userRole = user?.role || "customer";
      })
      .catch(() => {})
      .finally(() => next());
  } else {
    next();
  }
}

