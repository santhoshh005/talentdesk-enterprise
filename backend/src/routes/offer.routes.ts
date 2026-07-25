import { Router } from 'express';
import { OfferController } from '../controllers/offer.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', OfferController.getOffers);
router.post('/', OfferController.createOffer);

export default router;
