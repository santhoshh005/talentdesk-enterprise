import { Request, Response, NextFunction } from "express";
import { AIProviderService } from "../services/ai/ai-provider.service";

export class AIController {
  static async summarizeResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body;
      const orgId = req.user?.organizationId;
      const result = await AIProviderService.summarizeResume(
        text || "Senior Full Stack Engineer resume content",
        orgId,
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async batchMatchCandidates(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { candidates, jobTitle } = req.body;
      const orgId = req.user?.organizationId;

      const results = await Promise.all(
        (candidates || []).map(async (c: any) => {
          const matchResult = await AIProviderService.matchCandidateToJob(
            {
              name: c.firstName || c.name || "Candidate",
              currentRole: c.currentRole || c.role || "",
              skills: c.skills || [],
              experienceYears: c.experienceYears || c.exp || 0,
              summary: c.summary,
              aiSummary: c.aiSummary,
            },
            { title: jobTitle || "Job" },
            orgId,
          );
          return { candidateId: c.id, result: matchResult };
        }),
      );

      const scoresMap = results.reduce(
        (acc, curr) => {
          acc[curr.candidateId] = curr.result.overallScore;
          return acc;
        },
        {} as Record<string, number>,
      );

      res.json({ success: true, data: scoresMap });
    } catch (err) {
      next(err);
    }
  }

  static async generateJD(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        title,
        department,
        level,
        location,
        employmentType,
        keyResponsibilities,
        overviewSummary,
        experienceRequired,
        tone,
      } = req.body;
      const orgId = req.user?.organizationId;
      const result = await AIProviderService.generateJD(
        {
          title: title || "Senior Software Engineer",
          department,
          level,
          location,
          employmentType,
          keyResponsibilities: Array.isArray(keyResponsibilities)
            ? keyResponsibilities
            : keyResponsibilities
              ? String(keyResponsibilities).split(",")
              : [],
          overviewSummary,
          experienceRequired,
          tone,
        },
        orgId,
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async generateInterviewKit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { jobTitle, stage } = req.body;
      const orgId = req.user?.organizationId;
      const result = await AIProviderService.generateInterviewKit(
        {
          jobTitle: jobTitle || "Senior Product Designer",
          stage,
        },
        orgId,
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async assistantChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.body;
      const orgId = req.user?.organizationId;
      const reply = await AIProviderService.callGeminiJson<{ reply: string }>(
        `Answer as TalentOS AI Assistant: ${query || "Hello"}`,
        { reply: "I am your TalentOS AI Recruiting Assistant." },
        orgId,
      );
      res.json({ success: true, data: { response: reply.reply } });
    } catch (err) {
      next(err);
    }
  }
}
