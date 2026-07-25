import { Request, Response, NextFunction } from 'express';
import { UserRoleEnum } from '@prisma/client';

export const requireRoles = (roles: UserRoleEnum[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role) && req.user.role !== UserRoleEnum.SUPER_ADMIN) {
      res.status(403).json({
        success: false,
        error: `Permission denied. Requires one of roles: [${roles.join(', ')}]`,
      });
      return;
    }

    next();
  };
};
