import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.post('/resume-summary', AIController.summarizeResume);
router.post('/candidate-match', AIController.matchCandidate);
router.post('/generate-jd', AIController.generateJD);
router.post('/interview-generator', AIController.generateInterviewKit);
router.post('/assistant', AIController.assistantChat);

export default router;
