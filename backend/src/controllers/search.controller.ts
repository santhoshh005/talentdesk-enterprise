import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export class SearchController {
  static async booleanSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, location, minExp, stage } = req.body;
      const orgId = req.user!.organizationId;

      const terms = (query || "")
        .replace(/AND|OR|NOT|\(|\)/g, " ")
        .split(/\s+/)
        .filter(Boolean);

      const whereClause: any = {
        organizationId: orgId,
        isDeleted: false,
      };

      if (terms.length > 0) {
        whereClause.OR = terms.map((t: string) => ({
          OR: [
            { firstName: { contains: t, mode: "insensitive" } },
            { lastName: { contains: t, mode: "insensitive" } },
            { currentRole: { contains: t, mode: "insensitive" } },
            { summary: { contains: t, mode: "insensitive" } },
            { skills: { some: { name: { contains: t, mode: "insensitive" } } } },
          ],
        }));
      }

      if (stage) whereClause.stage = String(stage);
      if (location) whereClause.location = { contains: String(location), mode: "insensitive" };
      if (minExp) whereClause.experienceYears = { gte: Number(minExp) };

      const candidates = await prisma.candidate.findMany({
        where: whereClause,
        include: { skills: true },
        take: 20,
      });

      const formatted = candidates.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        role: c.currentRole || "Software Professional",
        loc: c.location || "Remote",
        exp: `${c.experienceYears || 4}y`,
        skills: c.skills.map((s) => s.name),
        score: c.qualityScore || 88,
        stage: c.stage,
        aiSummary: c.aiSummary,
      }));

      res.json({
        success: true,
        data: {
          totalMatches: formatted.length,
          query,
          results: formatted,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
