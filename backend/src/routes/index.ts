import { Router } from "express";
import authRoutes from "./auth.routes";
import candidateRoutes from "./candidate.routes";
import jobRoutes from "./job.routes";
import applicationRoutes from "./application.routes";
import aiRoutes from "./ai.routes";
import aiConfigRoutes from "./ai-config.routes";
import analyticsRoutes from "./analytics.routes";
import interviewRoutes from "./interview.routes";
import offerRoutes from "./offer.routes";
import organizationRoutes from "./organization.routes";
import searchRoutes from "./search.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/candidates", candidateRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/ai", aiRoutes);
router.use("/ai-config", aiConfigRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/interviews", interviewRoutes);
router.use("/offers", offerRoutes);
router.use("/organizations", organizationRoutes);
router.use("/search", searchRoutes);

export default router;
