import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

export const DEMO_SCHOOL_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_PRINCIPAL_ID = "00000000-0000-4000-8000-000000000101";

export type SchoolContext = {
  schoolId: string;
  userId: string;
  role: string;
  isDemo: boolean;
};

declare global {
  namespace Express {
    interface Request {
      schoolContext?: SchoolContext;
    }
  }
}

/**
 * Resolves Clerk identity to a school-owned user record.
 *
 * Development keeps the seeded demo experience available without requiring a
 * Clerk session. Production never falls back to a shared school.
 */
export async function schoolContext(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { userId: clerkUserId } = getAuth(req);

  if (!clerkUserId) {
    if (process.env.NODE_ENV === "production" || process.env.REQUIRE_AUTH === "true") {
      res.status(401).json({ error: "Authentication is required" });
      return;
    }

    req.schoolContext = {
      schoolId: DEMO_SCHOOL_ID,
      userId: DEMO_PRINCIPAL_ID,
      role: "principal",
      isDemo: true,
    };
    next();
    return;
  }

  const [user] = await db
    .select({
      id: usersTable.id,
      schoolId: usersTable.schoolId,
      role: usersTable.role,
    })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);

  if (!user) {
    res.status(403).json({ error: "Your account is not connected to a school" });
    return;
  }

  req.schoolContext = {
    schoolId: user.schoolId,
    userId: user.id,
    role: user.role,
    isDemo: false,
  };
  next();
}

export function getSchoolContext(req: Request): SchoolContext {
  if (!req.schoolContext) {
    throw new Error("School context middleware must run before this handler");
  }
  return req.schoolContext;
}