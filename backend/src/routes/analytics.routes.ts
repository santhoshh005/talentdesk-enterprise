import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJwt);

router.get("/dashboard", AnalyticsController.getDashboardMetrics);

export default router;
