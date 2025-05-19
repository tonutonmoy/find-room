import { PrismaClient } from '@prisma/client';
import {  ISaveRoom } from './saveRoom.interface';




const prisma = new PrismaClient();


;


export const createSaveRoomIntoDB = async (payload: ISaveRoom | any) => {

  console.log(payload)
  const isRoomExisting = await prisma.saveRoom.findFirst({
    where: {
      userId: payload.userId,
      listingId: payload.listingId,
    },
  });

  if (isRoomExisting) {
    // Room already saved, remove it (toggle off)
      const data= await prisma.saveRoom.delete({
      where: {
        id: isRoomExisting.id,
      },

    
    });

    return {data,message:"Remove SaveRoom  successfully"}
  } else {
    // Room not saved yet, create it (toggle on)
     const data= await prisma.saveRoom.create({
      data: payload,
    });
    return {data,message:"Added SaveRoom  successfully"}
  }
};



const getSaveRoomIntoDB = async (
  id: string,
  { skip, limit }: { skip: number; limit: number }
) => {
  const result = await prisma.saveRoom.findMany({
    where: { userId: id },
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
        },
      },
      listing: {
        include: {
          roommate: true,
          request:true
        },
      },
    },
  });

  const total = await prisma.saveRoom.count({
    where: { userId: id },
  });

  return {
    data: result,
    total,
  };
};




export const RaveRoomDBServices = {
  getSaveRoomIntoDB,
  createSaveRoomIntoDB,


};
