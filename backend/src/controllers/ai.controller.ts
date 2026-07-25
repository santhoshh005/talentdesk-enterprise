import { Request, Response, NextFunction } from 'express';
import { AIProviderService } from '../services/ai/ai-provider.service';

export class AIController {
  static async summarizeResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body;
      const orgId = req.user?.organizationId;
      const result = await AIProviderService.summarizeResume(text || 'Senior Full Stack Engineer resume content', orgId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async matchCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId, jobId } = req.body;
      const orgId = req.user?.organizationId;
      const result = await AIProviderService.matchCandidate(candidateId || 'c1', jobId || 'j1', orgId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async generateJD(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, department, keyResponsibilities } = req.body;
      const orgId = req.user?.organizationId;
      const result = await AIProviderService.generateJD({
        title: title || 'Senior Software Engineer',
        department,
        keyResponsibilities: Array.isArray(keyResponsibilities) ? keyResponsibilities : [],
      }, orgId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async generateInterviewKit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobTitle, stage } = req.body;
      const orgId = req.user?.organizationId;
      const result = await AIProviderService.generateInterviewKit({
        jobTitle: jobTitle || 'Senior Product Designer',
        stage,
      }, orgId);
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
        `Answer as TalentOS AI Assistant: ${query || 'Hello'}`,
        { reply: 'I am your TalentOS AI Recruiting Assistant.' },
        orgId
      );
      res.json({ success: true, data: { response: reply.reply } });
    } catch (err) {
      next(err);
    }
  }
}
