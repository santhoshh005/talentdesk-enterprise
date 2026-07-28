import { Router } from 'express';
import multer from 'multer';
import { CandidateController } from '../controllers/candidate.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.use(authenticateJwt);

router.get('/', CandidateController.getCandidates);
router.post('/', CandidateController.createCandidate);
router.post('/upload-resume', upload.single('file'), CandidateController.uploadResume);
router.get('/:id', CandidateController.getCandidateById);
router.patch('/:id', CandidateController.updateCandidate);
router.delete('/:id', CandidateController.deleteCandidate);

export default router;
