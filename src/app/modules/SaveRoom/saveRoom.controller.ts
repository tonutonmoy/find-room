import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

import { calculatePagination } from '../../utils/calculatePagination';
import { RaveRoomDBServices } from './saveRoom.service';




const createSaveRoom = catchAsync(async (req, res) => {



  req.body.userId= req.user.userId
  const result = await RaveRoomDBServices.createSaveRoomIntoDB(req.body);


  sendResponse(res, {
    statusCode: httpStatus.CREATED,
 
    message: result.message,
    data: result.data,
  });
});


const getMySaveRoom = catchAsync(async (req, res) => {
   const{skip,limit,page}=  calculatePagination({})

  const { data, total }  = await RaveRoomDBServices.getSaveRoomIntoDB(req.user.userId,{ skip, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'May SaveRoom retrieved successfully',
    meta: {
      limit,
      page,
      total,
      totalPage: Math.ceil(total / limit),
    
    },
    data,
  });
});




export const SaveRoomControllers = {
  createSaveRoom,
  getMySaveRoom,


  
};
