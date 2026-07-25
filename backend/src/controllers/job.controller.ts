import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { JobStatus, ApplicationStageType } from '@prisma/client';

const createJobSchema = z.object({
  title: z.string().min(1),
  departmentId: z.string().optional(),
  locationId: z.string().optional(),
  type: z.string().default('Full-time'),
  workplaceType: z.string().default('Hybrid'),
  description: z.string().min(1),
  requirements: z.string().optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  skills: z.array(z.string()).optional(),
  stages: z.array(z.string()).optional(),
});

export class JobController {
  static async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { search, status, department } = req.query;

      const whereClause: any = { organizationId: orgId, isDeleted: false };
      if (status) whereClause.status = String(status) as JobStatus;
      if (search) {
        whereClause.OR = [
          { title: { contains: String(search), mode: 'insensitive' } },
          { code: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      const jobs = await prisma.job.findMany({
        where: whereClause,
        include: {
          department: true,
          location: true,
          skills: true,
          pipelineStages: { orderBy: { order: 'asc' } },
          applications: {
            include: {
              candidate: true,
              pipelineStage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = jobs.map((j) => {
        const stageCounts: Record<string, number> = {};
        j.pipelineStages.forEach((s) => {
          stageCounts[s.name] = j.applications.filter((a) => a.pipelineStageId === s.id).length;
        });

        return {
          id: j.id,
          title: j.title,
          code: j.code || j.id.substring(0, 6).toUpperCase(),
          dept: j.department?.name || 'General',
          loc: j.location ? `${j.location.city}, ${j.location.country}` : 'Remote',
          status: j.status,
          type: j.type,
          workplaceType: j.workplaceType,
          candidatesCount: j.applications.length,
          stageCounts,
          skills: j.skills.map((s) => s.name),
          salary: j.minSalary && j.maxSalary ? `$${(j.minSalary / 1000).toFixed(0)}k–$${(j.maxSalary / 1000).toFixed(0)}k` : 'Competitive',
          posted: j.createdAt.toISOString().split('T')[0],
          description: j.description,
        };
      });

      res.json({ success: true, data: formatted });
    } catch (err) {
      next(err);
    }
  }

  static async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          department: true,
          location: true,
          skills: true,
          pipelineStages: { orderBy: { order: 'asc' } },
          applications: {
            include: {
              candidate: true,
              pipelineStage: true,
              interviews: true,
              offers: true,
            },
          },
        },
      });

      if (!job) {
        res.status(404).json({ success: false, error: 'Job requisition not found' });
        return;
      }

      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  static async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createJobSchema.parse(req.body);
      const orgId = req.user!.organizationId;

      const stageList = data.stages && data.stages.length > 0 ? data.stages : ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

      const job = await prisma.job.create({
        data: {
          organizationId: orgId,
          departmentId: data.departmentId,
          locationId: data.locationId,
          title: data.title,
          type: data.type,
          workplaceType: data.workplaceType,
          description: data.description,
          requirements: data.requirements,
          minSalary: data.minSalary,
          maxSalary: data.maxSalary,
          status: JobStatus.PUBLISHED,
          skills: {
            create: (data.skills || []).map((s) => ({ name: s, isRequired: true })),
          },
          pipelineStages: {
            create: stageList.map((stg, idx) => ({
              name: stg,
              order: idx + 1,
              type: idx === 0 ? ApplicationStageType.APPLIED : idx === stageList.length - 1 ? ApplicationStageType.HIRED : ApplicationStageType.INTERVIEW,
            })),
          },
        },
        include: {
          skills: true,
          pipelineStages: true,
        },
      });

      res.status(201).json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  static async getJobPipeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);

      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          pipelineStages: { orderBy: { order: 'asc' } },
          applications: {
            include: {
              candidate: { include: { skills: true } },
              pipelineStage: true,
              notes: true,
            },
          },
        },
      });

      if (!job) {
        // Fallback to first available active job or default
        const defaultJob = await prisma.job.findFirst({
          where: { organizationId: req.user!.organizationId },
          include: {
            pipelineStages: { orderBy: { order: 'asc' } },
            applications: {
              include: { candidate: { include: { skills: true } }, pipelineStage: true, notes: true },
            },
          },
        });

        if (!defaultJob) {
          res.json({ success: true, data: { stages: [] } });
          return;
        }

        res.json({ success: true, data: formatPipeline(defaultJob) });
        return;
      }

      res.json({ success: true, data: formatPipeline(job) });
    } catch (err) {
      next(err);
    }
  }
}

function formatPipeline(job: any) {
  const stages = job.pipelineStages.map((stage: any) => {
    const candidates = job.applications
      .filter((app: any) => app.pipelineStageId === stage.id)
      .map((app: any) => ({
        id: app.candidate.id,
        applicationId: app.id,
        name: `${app.candidate.firstName} ${app.candidate.lastName}`,
        role: app.candidate.currentRole || job.title,
        loc: app.candidate.location || 'Remote',
        score: app.matchScore || app.candidate.qualityScore || 85,
        skills: app.candidate.skills.map((s: any) => s.name),
        notes: app.notes.length,
        updated: app.updatedAt.toISOString().split('T')[0],
      }));

    return {
      id: stage.id,
      name: stage.name,
      count: candidates.length,
      candidates,
    };
  });

  return { jobId: job.id, jobTitle: job.title, stages };
}
