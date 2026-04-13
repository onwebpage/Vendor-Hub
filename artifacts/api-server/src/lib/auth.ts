import { Request, Response, NextFunction } from "express";
import { createClerkClient } from "@clerk/backend";

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
    (req as any).userId = payload.sub; // Clerk user ID
    (req as any).clerkUserId = payload.sub;
    next();
  } catch {
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
      .then(payload => {
        (req as any).userId = payload.sub;
        (req as any).clerkUserId = payload.sub;
      })
      .catch(() => {})
      .finally(() => next());
  } else {
    next();
  }
}
