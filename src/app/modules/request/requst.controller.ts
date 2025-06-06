import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

import { calculatePagination } from '../../utils/calculatePagination';
import { RequestDBServices } from './requst.service';




const createRequest = catchAsync(async (req, res) => {



  req.body.userId= req.user.userId
  const result = await RequestDBServices.createRequestIntoDB(req.body);


  sendResponse(res, {
    statusCode: httpStatus.CREATED,
 
    message: 'Added Request  successfully',
    data: result,
  });
});


const getMySendRequest = catchAsync(async (req, res) => {
  const{skip,limit,page}=  calculatePagination(req.query)

  const { data, total }= await RequestDBServices.getMySendRequestIntoDB(req.user.userId,{ skip, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'May Send Request retrieved successfully',
    meta: {
      limit,
      page,
      total,
      totalPage: Math.ceil(total / limit),
    
    },
    data,
  });



});
const getMyReceiveRequest = catchAsync(async (req, res) => {
  const{skip,limit,page}=  calculatePagination(req.query)

  const { data, total }= await RequestDBServices.getMyReceiveRequestIntoDB(req.params.id,{ skip, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'My Receive Request retrieved successfully',
    meta: {
      limit,
      page,
      total,
      totalPage: Math.ceil(total / limit),
    
    },
    data,
  });
});





const viewRequestUser = catchAsync(async (req, res) => {

  const data= await RequestDBServices.viewRequestUserIntoDB(req.params.id);

  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'view Request user retrieved successfully',
  
    data,
  });
});

const updateRequest = catchAsync(async (req, res) => {



  const  data= await RequestDBServices.updateRequestIntoDB(req.params.id,req.user.userId,req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: ' Request update retrieved successfully',
  
    data,
  });


});


const cancelRequest = catchAsync(async (req, res) => {

 

  const  data= await RequestDBServices.cancelRequestIntoDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: ' Request cancel retrieved successfully',
  
    data,
  });
});


const getNotification = catchAsync(async (req, res) => {



  const  data= await RequestDBServices.getNotificationIntoDB(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: ' Notificatione send retrieved successfully',
  
    data,
  });
});



export const RequesListingControllers = {
  createRequest,
  getMySendRequest,
  updateRequest,
  viewRequestUser,
  getNotification,
  cancelRequest,
  getMyReceiveRequest

  
};
