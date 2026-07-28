import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export class OrganizationController {
  static async getOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;

      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: {
          settings: true,
          departments: true,
          locations: true,
          teams: true,
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      res.json({ success: true, data: org });
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { careerPageTheme, aiProviderPreference, customDomain, emailSenderName } = req.body;

      const settings = await prisma.organizationSetting.upsert({
        where: { organizationId: orgId },
        update: { careerPageTheme, aiProviderPreference, customDomain, emailSenderName },
        create: {
          organizationId: orgId,
          careerPageTheme,
          aiProviderPreference,
          customDomain,
          emailSenderName,
        },
      });

      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }
}
