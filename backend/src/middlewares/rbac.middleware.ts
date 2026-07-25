import { Request, Response, NextFunction } from 'express';

// Open access middleware: all features are accessible to any user without role restrictions
export const requireRoles = (_roles: any[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    // Allow all authenticated users
    next();
  };
};
