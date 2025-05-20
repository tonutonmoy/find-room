import { PrismaClient } from '@prisma/client';
import { IRequest } from './requst.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';




const prisma = new PrismaClient();


;


export const createRequestIntoDB = async (payload: IRequest | any) => {

  const {listingId}=payload;

  const isExist= await prisma.listing.findFirst({where:{id:listingId}})

  if(!isExist){
 
        throw new AppError(httpStatus.NOT_FOUND, 'listing not found');
   


  }

  const data= await prisma.request.create({
    data:payload
  })

   return data
};


const getMyRequestIntoDB = async (id:string,{ skip, limit }: { skip: number; limit: number }) => {

 
  const result = await prisma.request.findMany({
    where:{userId:id},skip,
    take: limit,
  include:{listing:{include:{request:true,roommate:true}}}

  });

  const total = await prisma.request.count({
    where: { userId: id },
  });

  return {
    data: result,
    total,
  };
};

const viewRequestIntoDB = async (id:string,) => {


  const result = await prisma.user.findFirst({
    where:{id},
    
  select:{id:true,firstName:true,lastName:true,email:true,phoneNumber:true}

  });

   if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'You are not found!');
      }


  return  result
};

const getNotificationIntoDB = async (id: string) => {
  const result = await prisma.notification.findFirst({
    where: {
      reciverId: id,
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
        },
      },
      reciver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  return result;
};

const cancelRequestIntoDB = async (id: string) => {

 

  const isExist= await prisma.request.findFirst({where:{id}})

  if(!isExist){
 
        throw new AppError(httpStatus.NOT_FOUND, 'Requst not found');
   


  }


  const result = await prisma.request.delete({
    where: { id:id },
    
  });



    return result
  }



export const updateRequestIntoDB = async (id: string, senderId:string,requestStatus: string|any) => {

    const isExist = await prisma.request.findFirst({
    where: { id:id },
  
  });

   if (!isExist) {
        throw new AppError(httpStatus.NOT_FOUND, 'Request are not found!');
      }


  const updatedRequest = await prisma.request.update({
    where: { id:id },
    data:{
      requestStatus:requestStatus.requestStatus
    }
  });

  if (updatedRequest) {
    await prisma.notification.create({
      data: {
        senderId: senderId,
        reciverId: updatedRequest.userId, // assuming this is the request sender (the one who should be notified)
        requestStatus:updatedRequest.requestStatus
      },
    });

    return updatedRequest
  }




 
};

export const RequestDBServices = {
  getMyRequestIntoDB,
  createRequestIntoDB,
  updateRequestIntoDB,
  viewRequestIntoDB,
  getNotificationIntoDB,
  cancelRequestIntoDB

};
