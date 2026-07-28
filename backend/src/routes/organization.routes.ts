import { Router } from "express";
import { OrganizationController } from "../controllers/organization.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJwt);

router.get("/", OrganizationController.getOrganization);
router.put("/settings", OrganizationController.updateSettings);

export default router;
