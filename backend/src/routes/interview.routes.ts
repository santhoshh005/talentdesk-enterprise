import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', InterviewController.getInterviews);
router.post('/schedule', InterviewController.scheduleInterview);

export default router;
