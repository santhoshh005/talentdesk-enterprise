import { Router } from "express";
import { SearchController } from "../controllers/search.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJwt);

router.post("/boolean", SearchController.booleanSearch);

export default router;
