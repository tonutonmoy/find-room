import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RoomMatelistingControllers } from './roommateLinting.controller';
import { RoomMateListingValidation } from './roommateListing.validation';


const router = express.Router();

router.post(
  '/',auth(),
  validateRequest(RoomMateListingValidation.listingValidation),
  RoomMatelistingControllers.addRoomMateListing,
);
router.get(
  '/search',
  RoomMatelistingControllers.getFilteredRoomMateListings,
);
router.get(
  '/myListing',auth(),
  RoomMatelistingControllers.getMyRoomMateListing,
);
router.get(
  '/:id',auth(),
  RoomMatelistingControllers.getSingleRoomMateListing,
);


export const RoomateListingRouters = router;
