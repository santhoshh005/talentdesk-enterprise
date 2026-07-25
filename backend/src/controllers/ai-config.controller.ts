import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AIProviderService } from '../services/ai/ai-provider.service';
import { env } from '../config/env';

export class AIConfigController {
  static async getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const setting = await prisma.organizationSetting.findFirst({
        where: { organizationId: orgId },
      });

      const activeKey = setting?.geminiApiKey || AIProviderService.getCustomApiKey() || env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const hasCustomKey = Boolean(activeKey && activeKey.length > 5);
      const keyPreview = hasCustomKey ? `${activeKey!.substring(0, 6)}...${activeKey!.slice(-4)}` : '';

      res.json({
        success: true,
        data: {
          provider: setting?.aiProviderPreference || 'gemini',
          hasCustomKey,
          keyPreview,
          status: hasCustomKey ? 'Active & Ready' : 'Using Default System Key',
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { apiKey, provider = 'gemini' } = req.body;

      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
        res.status(400).json({ success: false, error: 'Please enter a valid Gemini API key (e.g. AIzaSy...)' });
        return;
      }

      const cleanKey = apiKey.trim();

      // Update in-memory service
      AIProviderService.setCustomApiKey(cleanKey);

      // Persist to database
      await prisma.organizationSetting.upsert({
        where: { organizationId: orgId },
        update: {
          geminiApiKey: cleanKey,
          aiProviderPreference: provider,
        },
        create: {
          organizationId: orgId,
          geminiApiKey: cleanKey,
          aiProviderPreference: provider,
        },
      });

      res.json({
        success: true,
        message: 'Gemini API key updated successfully! All AI features are now using your key.',
        data: {
          hasCustomKey: true,
          keyPreview: `${cleanKey.substring(0, 6)}...${cleanKey.slice(-4)}`,
          provider,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
