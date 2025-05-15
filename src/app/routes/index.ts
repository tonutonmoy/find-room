import express,{Request,Response} from 'express';
import { AuthRouters } from '../modules/Auth/auth.routes';
import { UserRouters } from '../modules/User/user.routes';
import { RoomateListingRouters } from '../modules/RoomMateListing/roommateListing.routes';
import { RequestRouters } from '../modules/request/requst.routes';
import { SaveRoomRouters } from '../modules/SaveRoom/saveRoom.routes';
import { upload } from '../middlewares/upload';
import { uploadFile } from '../utils/uploadFile';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouters,
  },
  {
    path: '/users',
    route: UserRouters,
  },
  
  {
    path: '/Listings',
    route: RoomateListingRouters,
  },
  
  {
    path: '/Requests',
    route: RequestRouters,
  },
  
  {
    path: '/SaveRooms',
    route: SaveRoomRouters,
  },
  
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

router.post("/upload", upload.single("upload"), (req: Request, res: Response) => {
  if (req.file) {
    const result = uploadFile(req.file);
    result.then((response) => {
      if (response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    });
  } else {
    return res.status(400).json({ success: false, error: "No file provided" });
  }
});

export default router;
