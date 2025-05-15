import express from 'express';
import auth from '../../middlewares/auth';

import { RequesListingControllers } from './requst.controller';
import validateRequest from '../../middlewares/validateRequest';
import { RequestValidation } from './requst.validation';



const router = express.Router();

router.post(
  '/',auth(),
  validateRequest(RequestValidation.requestValidation),
  RequesListingControllers.createRequest,
);
router.get(
  '/',auth(),
  RequesListingControllers.getMyRequest,
);
router.get(
  '/notification',auth(),
  RequesListingControllers.getNotification,
);
router.get(
  '/viewRequest/:id',auth(),
  RequesListingControllers.viewRequest,
);
router.put(
  '/:id',auth(),
  RequesListingControllers.updateRequest,
);


export const RequestRouters = router;
