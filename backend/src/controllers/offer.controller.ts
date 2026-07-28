import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { OfferStatus } from "@prisma/client";

export class OfferController {
  static async getOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;

      const offers = await prisma.offer.findMany({
        where: { application: { job: { organizationId: orgId } } },
        include: {
          application: { include: { candidate: true, job: true } },
          createdBy: { select: { firstName: true, lastName: true } },
        },
      });

      res.json({ success: true, data: offers });
    } catch (err) {
      next(err);
    }
  }

  static async createOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { applicationId, candidateId, salary, bonus, stockOptions, startDate } = req.body;

      let targetAppId = applicationId;
      if (!targetAppId && candidateId) {
        const app = await prisma.application.findFirst({ where: { candidateId } });
        targetAppId = app?.id;
      }

      if (!targetAppId) {
        const app = await prisma.application.findFirst({
          where: { job: { organizationId: req.user!.organizationId } },
        });
        targetAppId = app?.id;
      }

      if (!targetAppId) {
        res.status(400).json({ success: false, error: "No application found to generate offer" });
        return;
      }

      const offer = await prisma.offer.create({
        data: {
          applicationId: targetAppId,
          createdById: req.user!.id,
          salary: salary || 185000,
          bonus: bonus || 20000,
          stockOptions: stockOptions || "10,000 RSUs",
          startDate: startDate ? new Date(startDate) : new Date(Date.now() + 86400000 * 30),
          status: OfferStatus.APPROVED,
        },
      });

      res.status(201).json({ success: true, data: offer });
    } catch (err) {
      next(err);
    }
  }
}
