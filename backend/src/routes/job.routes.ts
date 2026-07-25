import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', JobController.getJobs);
router.post('/', JobController.createJob);
router.get('/:id', JobController.getJobById);
router.get('/:id/pipeline', JobController.getJobPipeline);

export default router;
