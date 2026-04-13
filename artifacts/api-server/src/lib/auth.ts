import { Request, Response, NextFunction } from "express";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

if (!process.env.CLERK_SECRET_KEY) {
  console.warn("CLERK_SECRET_KEY is not set! Authentication will fail.");
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const secretKey = process.env.CLERK_SECRET_KEY!;

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = await verifyToken(token, { secretKey });
    const clerkUserId = payload.sub;
    
    // Fetch user from DB to get their role and numeric ID
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
    
    (req as any).userId = user?.id;           // DB integer ID — used by all route handlers
    (req as any).clerkUserId = clerkUserId;   // Clerk string ID — used by /sync route
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
    verifyToken(token, { secretKey })
      .then(async payload => {
        const clerkUserId = payload.sub;
        const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
        
        (req as any).userId = user?.id;
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
