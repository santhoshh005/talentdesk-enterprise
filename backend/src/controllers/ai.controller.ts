import { Request, Response, NextFunction } from 'express';
import { AIProviderService } from '../services/ai/ai-provider.service';

export class AIController {
  static async summarizeResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body;
      const result = await AIProviderService.summarizeResume(text || 'Senior Full Stack Engineer resume content');
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async matchCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidate, job } = req.body;
      const result = await AIProviderService.matchCandidate(
        candidate || { skills: ['Go', 'Kafka', 'AWS'] },
        job || { title: 'Staff Backend Engineer' }
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async generateJD(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, department, keySkills } = req.body;
      const result = await AIProviderService.generateJobDescription({
        title: title || 'Senior Software Engineer',
        department,
        keySkills: Array.isArray(keySkills) ? keySkills : (keySkills ? String(keySkills).split(',') : ['TypeScript', 'React', 'Node.js']),
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async generateInterviewKit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobTitle, stage } = req.body;
      const result = await AIProviderService.generateInterviewKit({
        jobTitle: jobTitle || 'Senior Product Designer',
        stage,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async assistantChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.body;
      const reply = await AIProviderService.recruiterAssistantChat(query || 'Summarize top candidates');
      res.json({ success: true, data: { response: reply } });
    } catch (err) {
      next(err);
    }
  }
}
