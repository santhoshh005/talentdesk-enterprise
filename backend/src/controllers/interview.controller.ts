import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { InterviewStatus } from "@prisma/client";

export class InterviewController {
  static async getInterviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;

      const interviews = await prisma.interview.findMany({
        where: {
          application: { job: { organizationId: orgId } },
        },
        include: {
          application: {
            include: { candidate: true, job: true },
          },
          interviewers: { include: { user: true } },
          feedbacks: true,
        },
        orderBy: { scheduledAt: "asc" },
      });

      res.json({ success: true, data: interviews });
    } catch (err) {
      next(err);
    }
  }

  static async scheduleInterview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { applicationId, candidateId, title, scheduledAt, durationMins } = req.body;

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
        res
          .status(400)
          .json({ success: false, error: "No active application to schedule interview against" });
        return;
      }

      const interview = await prisma.interview.create({
        data: {
          applicationId: targetAppId,
          title: title || "Technical Architecture Screen",
          scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 86400000 * 2),
          durationMins: durationMins || 45,
          locationUrl: "https://meet.google.com/talentos-screen",
          status: InterviewStatus.SCHEDULED,
          interviewers: {
            create: [{ userId: req.user!.id }],
          },
        },
      });

      res.status(201).json({ success: true, data: interview });
    } catch (err) {
      next(err);
    }
  }
}
