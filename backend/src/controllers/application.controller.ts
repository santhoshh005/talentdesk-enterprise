import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const moveStageSchema = z.object({
  applicationId: z.string().optional(),
  candidateId: z.string().optional(),
  toStageId: z.string().optional(),
  toStageName: z.string().optional(),
});

export class ApplicationController {
  static async moveStage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = moveStageSchema.parse(req.body);

      let application = null;
      if (data.applicationId) {
        application = await prisma.application.findUnique({
          where: { id: data.applicationId },
          include: { pipelineStage: true, candidate: true },
        });
      } else if (data.candidateId) {
        application = await prisma.application.findFirst({
          where: { candidateId: data.candidateId },
          include: { pipelineStage: true, candidate: true },
        });
      }

      if (!application) {
        // Find or create application
        const candidate = await prisma.candidate.findFirst({
          where: { organizationId: req.user!.organizationId },
        });
        const job = await prisma.job.findFirst({
          where: { organizationId: req.user!.organizationId },
          include: { pipelineStages: true },
        });

        if (candidate && job && job.pipelineStages.length > 0) {
          const targetStage =
            job.pipelineStages.find((s) => s.name === data.toStageName) || job.pipelineStages[0];
          application = await prisma.application.upsert({
            where: { jobId_candidateId: { jobId: job.id, candidateId: candidate.id } },
            update: { pipelineStageId: targetStage.id },
            create: {
              jobId: job.id,
              candidateId: candidate.id,
              pipelineStageId: targetStage.id,
            },
            include: { pipelineStage: true, candidate: true },
          });
        }
      }

      if (!application) {
        res
          .status(404)
          .json({ success: false, error: "Application or target candidate not found" });
        return;
      }

      let newStageId = application.pipelineStageId;
      let newStageName = data.toStageName || "Interview";

      if (data.toStageId) {
        const stageObj = await prisma.pipelineStage.findUnique({ where: { id: data.toStageId } });
        if (stageObj) {
          newStageId = stageObj.id;
          newStageName = stageObj.name;
        }
      } else if (data.toStageName) {
        const stageObj = await prisma.pipelineStage.findFirst({
          where: { jobId: application.jobId, name: data.toStageName },
        });
        if (stageObj) {
          newStageId = stageObj.id;
        }
      }

      const updatedApp = await prisma.application.update({
        where: { id: application.id },
        data: {
          pipelineStageId: newStageId,
          stageHistory: {
            create: {
              fromStage: application.pipelineStage.name,
              toStage: newStageName,
            },
          },
        },
      });

      await prisma.candidate.update({
        where: { id: application.candidateId },
        data: { stage: newStageName },
      });

      await prisma.auditLog.create({
        data: {
          organizationId: req.user!.organizationId,
          userId: req.user!.id,
          action: "APPLICATION_STAGE_MOVED",
          entity: "Application",
          entityId: application.id,
          details: { from: application.pipelineStage.name, to: newStageName },
        },
      });

      res.json({
        success: true,
        data: {
          applicationId: updatedApp.id,
          newStage: newStageName,
          candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async addNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const applicationId = String(req.params.applicationId);
      const { content } = req.body;

      const note = await prisma.applicationNote.create({
        data: {
          applicationId,
          authorId: req.user!.id,
          content,
        },
        include: { author: { select: { firstName: true, lastName: true } } },
      });

      res.status(201).json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  }
}
