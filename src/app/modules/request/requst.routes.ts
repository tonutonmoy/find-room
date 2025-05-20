import express from 'express';
import auth from '../../middlewares/auth';

import { RequesListingControllers } from './requst.controller';
import validateRequest from '../../middlewares/validateRequest';
import { RequestValidation } from './requst.validation';



const router = express.Router();
router.put(
  '/cancel/:id',auth(),
  RequesListingControllers.cancelRequest,
);

router.post(
  '/',auth(),
  validateRequest(RequestValidation.requestValidation),
  RequesListingControllers.createRequest,
);
router.get(
  '/sendRequest',auth(),
  RequesListingControllers.getMySendRequest,
);
router.get(
  '/receiveRequest/:id',auth(),
  RequesListingControllers.getMyReceiveRequest,
);
router.get(
  '/notification',auth(),
  RequesListingControllers.getNotification,
);
router.get(
  '/viewRequestUser/:id',auth(),
  RequesListingControllers.viewRequestUser,
);
router.put(
  '/:id',auth(),
  RequesListingControllers.updateRequest,
);


export const RequestRouters = router;
