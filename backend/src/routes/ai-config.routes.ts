import { Router } from "express";
import { AIConfigController } from "../controllers/ai-config.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJwt);

router.get("/", AIConfigController.getConfig);
router.post("/", AIConfigController.updateConfig);

export default router;
