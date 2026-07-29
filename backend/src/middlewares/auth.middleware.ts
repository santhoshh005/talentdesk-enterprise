import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { UserRoleEnum } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  organizationId: string;
  email: string;
  role: UserRoleEnum;
  firstName: string;
  lastName: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.accessToken;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : tokenFromCookie;

    if (!token) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required. No token provided." });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        organizationId: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: "User session invalid or deactivated." });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid or expired access token." });
  }
};
