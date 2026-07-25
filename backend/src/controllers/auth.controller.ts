import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  organizationName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        res.status(400).json({ success: false, error: 'Email already registered' });
        return;
      }

      let org = await prisma.organization.findFirst({ where: { slug: 'talentos-enterprise' } });
      if (!org) {
        org = await prisma.organization.create({
          data: {
            name: data.organizationName || 'My Organization',
            slug: (data.organizationName || 'my-org').toLowerCase().replace(/\s+/g, '-'),
          },
        });
      }

      const passwordHash = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({
        data: {
          organizationId: org.id,
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'ADMIN',
          isVerified: true,
        },
      });

      const accessToken = jwt.sign(
        { id: user.id, organizationId: user.organizationId, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: env.NODE_ENV === 'production' });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: user.organizationId,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: { organization: true },
      });

      if (!user) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(data.password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      const accessToken = jwt.sign(
        { id: user.id, organizationId: user.organizationId, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: env.NODE_ENV === 'production' });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: user.organizationId,
            organization: { name: user.organization.name },
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { organization: true },
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user?.id,
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName,
            role: user?.role,
            organizationId: user?.organizationId,
            organization: user?.organization,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('accessToken');
    res.json({ success: true, message: 'Logged out successfully' });
  }
}
