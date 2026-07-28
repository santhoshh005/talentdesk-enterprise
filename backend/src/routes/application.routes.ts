import { Router } from "express";
import { ApplicationController } from "../controllers/application.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJwt);

router.post("/move-stage", ApplicationController.moveStage);
router.post("/:applicationId/notes", ApplicationController.addNote);

export default router;
