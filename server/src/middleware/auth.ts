import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export interface AuthUser {
  id: string;
  email: string;
  plan: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Fetch fresh plan from DB to catch upgrades/downgrades
    const freshUser = await prisma.user.findUnique({ where: { id: payload.id } });
    if (freshUser) {
      payload.plan = freshUser.plan;
      // Check BETA_EMAILS override
      const betaEmails = new Set(
        (process.env.BETA_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean)
      );
      if (betaEmails.has(freshUser.email.toLowerCase())) {
        payload.plan = "pro";
      }
    }

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7);
    try {
      req.user = jwt.verify(token, JWT_SECRET) as AuthUser;
    } catch {
      // Invalid token — proceed without user
    }
  }
  next();
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "30d" });
}
