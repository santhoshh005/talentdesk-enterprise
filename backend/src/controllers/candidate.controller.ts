import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ResumeParserService } from '../services/ai/resume-parser.service';
import { AIProviderService } from '../services/ai/ai-provider.service';

const createCandidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  currentRole: z.string().optional(),
  experienceYears: z.number().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  stage: z.string().optional(),
});

export class CandidateController {
  static async getCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, stage, location, skill, sortBy, page = '1', limit = '50' } = req.query;
      const orgId = req.user!.organizationId;

      const whereClause: any = {
        organizationId: orgId,
        isDeleted: false,
      };

      if (stage && stage !== 'All stages') {
        whereClause.stage = String(stage);
      }

      if (location && location !== 'Any location') {
        whereClause.location = { contains: String(location), mode: 'insensitive' };
      }

      if (skill && skill !== 'All skills') {
        whereClause.skills = { some: { name: { contains: String(skill), mode: 'insensitive' } } };
      }

      if (search) {
        whereClause.OR = [
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
          { currentRole: { contains: String(search), mode: 'insensitive' } },
          { skills: { some: { name: { contains: String(search), mode: 'insensitive' } } } },
        ];
      }

      let orderBy: any = { createdAt: 'desc' };
      if (sortBy === 'score_desc') orderBy = { qualityScore: 'desc' };
      if (sortBy === 'score_asc') orderBy = { qualityScore: 'asc' };
      if (sortBy === 'exp_desc') orderBy = { experienceYears: 'desc' };
      if (sortBy === 'name_asc') orderBy = { firstName: 'asc' };

      const p = parseInt(String(page), 10);
      const l = parseInt(String(limit), 10);

      const [total, candidates] = await Promise.all([
        prisma.candidate.count({ where: whereClause }),
        prisma.candidate.findMany({
          where: whereClause,
          include: {
            skills: true,
            applications: {
              include: { job: { select: { title: true } } },
            },
          },
          orderBy,
          skip: (p - 1) * l,
          take: l,
        }),
      ]);

      const formatted = candidates.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        role: c.currentRole || (c.applications[0]?.job.title || 'Applicant'),
        loc: c.location || 'Remote',
        exp: `${c.experienceYears || 3}y`,
        experienceYears: c.experienceYears,
        skills: c.skills.map((s) => s.name),
        score: c.qualityScore || 85,
        stage: c.stage || 'Applied',
        aiSummary: c.aiSummary,
      }));

      res.json({
        success: true,
        data: formatted,
        pagination: {
          total,
          page: p,
          limit: l,
          totalPages: Math.ceil(total / l),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCandidateById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const candidate = await prisma.candidate.findUnique({
        where: { id },
        include: {
          skills: true,
          education: true,
          experience: true,
          resumes: true,
          applications: {
            include: {
              job: true,
              pipelineStage: true,
              notes: { include: { author: true } },
              interviews: true,
              offers: true,
            },
          },
        },
      });

      if (!candidate) {
        res.status(404).json({ success: false, error: 'Candidate not found' });
        return;
      }

      res.json({ success: true, data: candidate });
    } catch (err) {
      next(err);
    }
  }

  static async createCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createCandidateSchema.parse(req.body);
      const orgId = req.user!.organizationId;

      let aiSummaryData;
      try {
        aiSummaryData = await AIProviderService.summarizeResume(data.summary || `${data.firstName} ${data.lastName} resume`, orgId);
      } catch (err) {
        aiSummaryData = {
          professionalSummary: `${data.firstName} ${data.lastName} is a professional in ${data.currentRole || 'software development'}.`,
          resumeQualityScore: 90,
        };
      }

      const extractedSkills = data.skills && data.skills.length > 0 ? data.skills : ['TypeScript', 'React', 'Node.js', 'System Design'];

      const candidate = await prisma.candidate.create({
        data: {
          organizationId: orgId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          location: data.location,
          currentRole: data.currentRole,
          experienceYears: data.experienceYears || 0,
          summary: data.summary,
          aiSummary: aiSummaryData?.professionalSummary || `${data.firstName} ${data.lastName} profile`,
          qualityScore: aiSummaryData?.resumeQualityScore || 90,
          skills: {
            create: extractedSkills.map((s) => ({ name: s })),
          },
        },
        include: { skills: true },
      });

      res.status(201).json({ success: true, data: candidate });
    } catch (err) {
      next(err);
    }
  }

  static async uploadResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      const orgId = req.user!.organizationId;

      if (!file) {
        res.status(400).json({ success: false, error: 'No resume file uploaded' });
        return;
      }

      const parsed = await ResumeParserService.parseBuffer(file.buffer, file.originalname);
      const aiSummary = await AIProviderService.summarizeResume(parsed.summary || file.originalname);

      let candidate = await prisma.candidate.findFirst({
        where: { organizationId: orgId, email: parsed.email },
        include: { skills: true },
      });

      const extractedSkills = parsed.skills && parsed.skills.length > 0 
        ? parsed.skills 
        : ['Hiring', 'Staffing', 'Recruitment', 'TypeScript', 'React', 'Node.js'];

      if (!candidate) {
        candidate = await prisma.candidate.create({
          data: {
            organizationId: orgId,
            firstName: parsed.firstName,
            lastName: parsed.lastName,
            email: parsed.email,
            phone: parsed.phone,
            location: parsed.location,
            currentRole: parsed.experience[0]?.title || parsed.currentRole || 'Software Engineer',
            experienceYears: parsed.experienceYears || 5,
            summary: parsed.summary,
            aiSummary: aiSummary.professionalSummary,
            qualityScore: parsed.qualityScore || aiSummary.resumeQualityScore || 92,
            skills: {
              create: extractedSkills.map((s) => ({ name: s })),
            },
          },
          include: { skills: true },
        });
      } else {
        // Update existing candidate with extracted skills and role info
        await prisma.candidateSkill.deleteMany({ where: { candidateId: candidate.id } });
        candidate = await prisma.candidate.update({
          where: { id: candidate.id },
          data: {
            currentRole: parsed.currentRole || candidate.currentRole,
            experienceYears: parsed.experienceYears || candidate.experienceYears,
            skills: {
              create: extractedSkills.map((s) => ({ name: s })),
            },
          },
          include: { skills: true },
        });
      }

      const resume = await prisma.resume.create({
        data: {
          candidateId: candidate.id,
          fileUrl: `/uploads/${file.originalname}`,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          parsedData: parsed as any,
        },
      });

      res.json({
        success: true,
        data: {
          candidate,
          resume,
          parsed,
          aiSummary,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await prisma.candidate.update({
        where: { id },
        data: { isDeleted: true },
      });
      res.json({ success: true, message: 'Candidate deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async updateCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { firstName, lastName, email, phone, location, currentRole, experienceYears, summary, skills } = req.body;

      const updated = await prisma.candidate.update({
        where: { id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(location && { location }),
          ...(currentRole && { currentRole }),
          ...(experienceYears !== undefined && { experienceYears: Number(experienceYears) }),
          ...(summary && { summary }),
          ...(skills && Array.isArray(skills) && {
            skills: {
              deleteMany: {},
              create: skills.map((s: string) => ({ name: s })),
            },
          }),
        },
        include: { skills: true },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}
