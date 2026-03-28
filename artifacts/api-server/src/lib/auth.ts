import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "vendorkart_salt").digest("hex");
}

export function generateToken(userId: number, role: string): string {
  const payload = JSON.stringify({ userId, role, iat: Date.now() });
  return Buffer.from(payload).toString("base64");
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    return payload;
  } catch {
    return null;
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
  (req as any).userId = payload.userId;
  (req as any).userRole = payload.role;
  next();
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
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload) {
      (req as any).userId = payload.userId;
      (req as any).userRole = payload.role;
    }
  }
  next();
}
