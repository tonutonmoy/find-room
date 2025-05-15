import express from 'express';
import auth from '../../middlewares/auth';

import { SaveRoomControllers } from './saveRoom.controller';
import validateRequest from '../../middlewares/validateRequest';
import { RequestValidation } from './saveRoom.validation';



const router = express.Router();

router.post(
  '/',auth(),
  validateRequest(RequestValidation.requestValidation),
  SaveRoomControllers.createSaveRoom,
);
router.get(
  '/',auth(),
  SaveRoomControllers.getMySaveRoom
);

export const SaveRoomRouters = router;
