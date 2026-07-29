import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { JobStatus, ApplicationStageType } from "@prisma/client";

const createJobSchema = z.object({
  title: z.string().min(1),
  departmentId: z.string().optional(),
  locationId: z.string().optional(),
  type: z.string().default("Full-time"),
  workplaceType: z.string().default("Hybrid"),
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
      const { search, status } = req.query;

      const whereClause: any = { organizationId: orgId, isDeleted: false };
      if (status && status !== "ALL") {
        // PAUSED is stored as DRAFT in the database
        const dbStatus = String(status) === "PAUSED" ? "DRAFT" : String(status);
        whereClause.status = dbStatus as JobStatus;
      }
      if (search) {
        whereClause.OR = [
          { title: { contains: String(search), mode: "insensitive" } },
          { code: { contains: String(search), mode: "insensitive" } },
        ];
      }

      const jobs = await prisma.job.findMany({
        where: whereClause,
        include: {
          department: true,
          location: true,
          skills: true,
          pipelineStages: { orderBy: { order: "asc" } },
          applications: {
            include: {
              candidate: true,
              pipelineStage: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
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
          dept: j.department?.name || "Engineering",
          loc: j.location ? `${j.location.city}, ${j.location.country}` : "Remote",
          status: j.status,
          type: j.type,
          workplaceType: j.workplaceType,
          applicants: j.applications.length,
          candidatesCount: j.applications.length,
          stageCounts,
          skills: j.skills.map((s) => s.name),
          salary:
            j.minSalary && j.maxSalary
              ? `$${(j.minSalary / 1000).toFixed(0)}k–$${(j.maxSalary / 1000).toFixed(0)}k`
              : "$140k–$180k",
          posted: j.createdAt.toISOString().split("T")[0],
          description: j.description,
        };
      });

      // Strict Deduplication by Title
      const seenTitles = new Set<string>();
      const uniqueJobs = formatted.filter((j) => {
        const key = j.title.toLowerCase().trim();
        if (seenTitles.has(key)) return false;
        seenTitles.add(key);
        return true;
      });

      res.json({ success: true, data: uniqueJobs });
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
          pipelineStages: { orderBy: { order: "asc" } },
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
        res.status(404).json({ success: false, error: "Job not found" });
        return;
      }

      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  static async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const data = createJobSchema.parse(req.body);

      // Check if job with identical title already exists to prevent duplicate position entries
      const existingJob = await prisma.job.findFirst({
        where: {
          organizationId: orgId,
          isDeleted: false,
          title: { equals: data.title, mode: "insensitive" },
        },
      });

      if (existingJob) {
        const updated = await prisma.job.update({
          where: { id: existingJob.id },
          data: {
            description: data.description || existingJob.description,
            status: "PUBLISHED",
          },
        });
        res.json({
          success: true,
          data: updated,
          message: "Position already exists; updated details.",
        });
        return;
      }

      const count = await prisma.job.count({ where: { organizationId: orgId } });
      const code = `REQ-${(count + 101).toString()}`;

      let finalDepartmentId = undefined;
      if (data.departmentId) {
        // If it looks like a UUID we could just use it, but since frontend sends names like "Engineering", let's upsert
        const dept = await prisma.department.upsert({
          where: { organizationId_name: { organizationId: orgId, name: data.departmentId } },
          update: {},
          create: { organizationId: orgId, name: data.departmentId },
        });
        finalDepartmentId = dept.id;
      }

      let finalLocationId = undefined;
      if (data.locationId) {
        // Upsert location by name, assuming locationId from frontend is just a city/name string
        let loc = await prisma.location.findFirst({
          where: { organizationId: orgId, city: { equals: data.locationId, mode: "insensitive" } },
        });
        if (!loc) {
          loc = await prisma.location.create({
            data: { organizationId: orgId, city: data.locationId, country: "US" },
          });
        }
        finalLocationId = loc.id;
      }

      const job = await prisma.job.create({
        data: {
          organizationId: orgId,
          departmentId: finalDepartmentId,
          locationId: finalLocationId,
          title: data.title,
          code,
          type: data.type,
          workplaceType: data.workplaceType,
          description: data.description,
          requirements: data.requirements,
          minSalary: data.minSalary,
          maxSalary: data.maxSalary,
          status: "PUBLISHED",
          pipelineStages: {
            create: (data.stages || ["Sourced", "Screening", "Interview", "Offer", "Hired"]).map(
              (name, index) => ({
                name,
                order: index + 1,
                type: (name.toUpperCase().includes("SCREEN")
                  ? "SCREENING"
                  : name.toUpperCase().includes("INTERVIEW")
                    ? "INTERVIEW"
                    : name.toUpperCase().includes("OFFER")
                      ? "OFFER"
                      : name.toUpperCase().includes("HIRE")
                        ? "HIRED"
                        : "APPLIED") as ApplicationStageType,
              }),
            ),
          },
        },
      });

      res.status(201).json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  static async updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const {
        title,
        status,
        description,
        type,
        workplaceType,
        departmentId,
        locationId,
        minSalary,
        maxSalary,
      } = req.body;
      const orgId = req.user!.organizationId;

      let validStatus: any = status;
      if (status === "PAUSED" || status === "PAUSE") {
        validStatus = "DRAFT";
      } else if (status === "PUBLISH" || status === "PUBLISHED") {
        validStatus = "PUBLISHED";
      } else if (status === "CLOSE" || status === "CLOSED") {
        validStatus = "CLOSED";
      }

      let finalDepartmentId = undefined;
      if (departmentId) {
        const dept = await prisma.department.upsert({
          where: { organizationId_name: { organizationId: orgId, name: departmentId } },
          update: {},
          create: { organizationId: orgId, name: departmentId },
        });
        finalDepartmentId = dept.id;
      }

      let finalLocationId = undefined;
      if (locationId) {
        let loc = await prisma.location.findFirst({
          where: { organizationId: orgId, city: { equals: locationId, mode: "insensitive" } },
        });
        if (!loc) {
          loc = await prisma.location.create({
            data: { organizationId: orgId, city: locationId, country: "US" },
          });
        }
        finalLocationId = loc.id;
      }

      const updated = await prisma.job.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(validStatus && { status: validStatus as JobStatus }),
          ...(description && { description }),
          ...(type && { type }),
          ...(workplaceType && { workplaceType }),
          ...(finalDepartmentId && { departmentId: finalDepartmentId }),
          ...(finalLocationId && { locationId: finalLocationId }),
          ...(minSalary !== undefined && { minSalary }),
          ...(maxSalary !== undefined && { maxSalary }),
        },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await prisma.job.update({
        where: { id },
        data: { isDeleted: true, status: "ARCHIVED" },
      });
      res.json({ success: true, message: "Job position deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  static async getJobPipeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const stages = await prisma.pipelineStage.findMany({
        where: { jobId: id },
        orderBy: { order: "asc" },
      });
      res.json({ success: true, data: stages });
    } catch (err) {
      next(err);
    }
  }
}
