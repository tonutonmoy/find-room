import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

import { calculatePagination } from '../../utils/calculatePagination';
import { RequestDBServices } from './requst.service';



const createRequest = catchAsync(async (req, res) => {

  console.log('hello');

  req.body.userId= req.user.userId
  const result = await RequestDBServices.createRequestIntoDB(req.body);


  sendResponse(res, {
    statusCode: httpStatus.CREATED,
 
    message: 'Added Request  successfully',
    data: result,
  });
});


const getMyRequest = catchAsync(async (req, res) => {
  const{skip,limit,page}=  calculatePagination({})

  const { data, total }= await RequestDBServices.getMyRequestIntoDB(req.user.userId,{ skip, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'May Request retrieved successfully',
    meta: {
      limit,
      page,
      total,
      totalPage: Math.ceil(total / limit),
    
    },
    data,
  });
});


const viewRequest = catchAsync(async (req, res) => {


  const data= await RequestDBServices.viewRequestIntoDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'view Request retrieved successfully',
  
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
  getMyRequest,
  updateRequest,
  viewRequest,
  getNotification

  
};
