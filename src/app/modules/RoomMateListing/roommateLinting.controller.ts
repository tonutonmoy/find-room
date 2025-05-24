import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

import { calculatePagination } from '../../utils/calculatePagination';
import { RoomMateListingDBServices } from './roommateListing.service';



const addRoomMateListing = catchAsync(async (req, res) => {

  req.body.userId= req.user.userId
  const result = await RoomMateListingDBServices.createRoomMateListingIntoDB(req.body);


  sendResponse(res, {
    statusCode: httpStatus.CREATED,
 
    message: 'Added RoomateListing  successfully',
    data: result,
  });
});


// ___________________________________
const getFilteredRoomMateListings = catchAsync(async (req, res) => {
  const { skip, limit, page } = calculatePagination(req.query);


  
  const filters: any = {
    minRent: req.query.minRent || 0,
    maxRent: req.query.maxRent || 10000,
    availableFrom: req.query.availableFrom || '',
    lastDateOfavailable: req.query.lastDateOfavailable || '',
    language: req.query.language || '',
    minAge: req.query.minAge || 0,
    maxAge: req.query.maxAge || 100,
    gender: req.query.gender || '',
    pets: req.query.pets || false,
    smokingAllowed: req.query.smokingAllowed || 'Any',
    requiredAmenities: typeof req.query.requiredAmenities === 'string'
      ? req.query.requiredAmenities.split(',')
      : [],
    spendingFreeTime: typeof req.query.spendingFreeTime === 'string'
      ? req.query.spendingFreeTime.split(',')
      : [],
    searchRadius: req.query.searchRadius || 15,
    location: {
      lat: parseFloat(req.query.lat as string) || 0,
      lng: parseFloat(req.query.lng as string) || 0,
    },
  };

  const { data, meta } = await RoomMateListingDBServices.getFilteredRoomMateListingsIntoDB(
    filters,
    { skip, limit },req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Filtered room listings retrieved successfully',
    meta: meta,
    data,
  });
});



// ------------------
const getMyRoomMateListing = catchAsync(async (req, res) => {
 
  const{skip,limit,page}=  calculatePagination({})



  const { data,total } = await RoomMateListingDBServices.getMyRoomMateListingIntoDB(req.user.userId,{ skip, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'My Listing retrieved successfully',
    meta: {
      limit,
      page,
      total,
      totalPage: Math.ceil(total / limit),
    
    },
    data,
  });
});


const getSingleRoomMateListing = catchAsync(async (req, res) => {
 
  const{skip,limit,page}=  calculatePagination({})



  const data = await RoomMateListingDBServices.getSingleRoomMateListingIntoDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'single Listing retrieved successfully',
   
    data,
  });
});


const updateSingleRoomMateListingStatus = catchAsync(async (req, res) => {
 

  const data = await RoomMateListingDBServices.updateSingleRoomMateListingStatusIntoDB(req.params.id,req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'update Listing status successfully',
   
    data,
  });
});


const updateRoomMateListing = catchAsync(async (req, res) => {
 

  const data = await RoomMateListingDBServices.updateRoomMateListingIntoDB(req.params.id,req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'update Listing  successfully',
   
    data,
  });
});



export const RoomMatelistingControllers = {
  addRoomMateListing,
  getMyRoomMateListing,
  getFilteredRoomMateListings,
  getSingleRoomMateListing,
  updateSingleRoomMateListingStatus,
  updateRoomMateListing

  
};
