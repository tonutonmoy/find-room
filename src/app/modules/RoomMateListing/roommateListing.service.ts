import { PrismaClient } from '@prisma/client';
import { IListing } from './roommateListing.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';


const prisma = new PrismaClient();

// Function to create a new RoomMateListing
;


export const createRoomMateListingIntoDB = async (payload: IListing | any) => {
 
  const roommateData = [...(payload?.roommate || [])];
  const listingPayload = { ...payload, roommate: undefined };

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create listing
      const listing = await tx.listing.create({
        data: listingPayload,
      });

      // Step 2: Create roommates linked to this listing
      if (roommateData.length > 0) {
        await tx.roommate.createMany({
          data: roommateData.map((roomie: any) => ({
            ...roomie,
            listingId: listing.id,
          })),
        });
      }

      return listing;
    });

  
    return result;
  } catch (error) {
    console.error('Error creating listing with roommates:', error);
    throw error;
  }
};





// _______________________________

// strat

// const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
//   const R = 6371000;
//   const phi1 = lat1 * (Math.PI / 180);
//   const phi2 = lat2 * (Math.PI / 180);
//   const deltaPhi = (lat2 - lat1) * (Math.PI / 180);
//   const deltaLambda = (lon2 - lon1) * (Math.PI / 180);

//   const a =
//     Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
//     Math.cos(phi1) * Math.cos(phi2) *
//     Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// export const getFilteredRoomMateListingsIntoDB = async (
//   filters: any,
//   { skip, limit }: { skip: number; limit: number },
//   searchParams: object,
//   currentUser: any = null
// ) => {
//   const whereConditions: any = {
//     rentCHF: {
//       gte: Number(filters.minRent),
//       lte: Number(filters.maxRent),
//     },
//     age: {
//       gte: Number(filters.minAge),
//       lte: Number(filters.maxAge),
//     },
//     status: 'Published',
//   };

//   if (filters.availableFrom) {
//     const date = new Date(filters.availableFrom);
//     if (!isNaN(date.getTime())) {
//       whereConditions.availableFrom = { lte: date };
//     }
//   }

//   if (filters.gender && filters.gender !== 'Any') {
//     whereConditions.gender = filters.gender;
//   }

//   if (filters.language) {
//     whereConditions.language = {
//       contains: filters.language,
//       mode: 'insensitive',
//     };
//   }

//   if (filters.smokingAllowed && filters.smokingAllowed !== 'Any') {
//     whereConditions.smokingAllowed = filters.smokingAllowed;
//   }

//   if (filters.pets === 'true') {
//     whereConditions.newPets = {
//       not: 'Not allowed',
//     };
//   }

//   if (filters.requiredAmenities?.length > 0) {
//     whereConditions.amenitiesAndServices = {
//       hasEvery: filters.requiredAmenities,
//     };
//   }

//   if (filters.spendingFreeTime?.length > 0) {
//     whereConditions.spendingFreeTime = {
//       contains: filters.spendingFreeTime.join(','),
//       mode: 'insensitive',
//     };
//   }

//   const total = await prisma.listing.count({ where: whereConditions });

//   const listings = await prisma.listing.findMany({
//     where: whereConditions,
//     include: {
//       roommate: true,
//       request: {
//         include: {
//           user: true,
//         },
//       },
//     },
//     skip,
//     take: limit,
//   });

//   const filteredListings = listings.filter((listing) => {
//     if (
//       filters.location?.lat &&
//       filters.location?.lng &&
//       !isNaN(filters.location.lat) &&
//       !isNaN(filters.location.lng)
//     ) {
//       const maxDistance = (filters.searchRadius ?? 15) * 1000;
//       const coords = (listing.location as any)?.coordinates;
//       if (!coords || coords.length !== 2) return false;

//       const [lng, lat] = coords;
//       const dist = getDistanceInMeters(filters.location.lat, filters.location.lng, lat, lng);
//       return dist <= maxDistance;
//     }
//     return true;
//   });

//   const scoredListings = filteredListings.map((listing: any) => {
//     let score = 0;
//     let maxScore = 0;

//     const primaryMatches = [
//       listing.gender === filters.gender,
//       filters.language && listing.language?.toLowerCase() === filters.language.toLowerCase(),
//       filters.smokingAllowed && listing.smokingAllowed === filters.smokingAllowed,
//       filters.pets === 'true' && listing.newPets !== 'Not allowed',
//       filters.availableFrom && new Date(listing.availableFrom) <= new Date(filters.availableFrom),
//       filters.location && listing.location,
//     ];

//     const primarySet = primaryMatches.filter(Boolean).length;
//     score += primarySet * 1000;
//     maxScore += (filters.gender ? 1000 : 0) +
//       (filters.language ? 1000 : 0) +
//       (filters.smokingAllowed ? 1000 : 0) +
//       (filters.pets === 'true' ? 1000 : 0) +
//       (filters.availableFrom ? 1000 : 0) +
//       (filters.location ? 1000 : 0);

//     let constraintMatches = 0;
//     if (currentUser) {
//       const creatorConstraints = [
//         { match: listing.minAge <= currentUser.age && listing.maxAge >= currentUser.age },
//         { match: listing.gender === currentUser.gender },
//         {
//           match: listing.language?.toLowerCase() === currentUser.language?.toLowerCase(),
//         },
//       ];

//       constraintMatches = creatorConstraints.filter((c) => c.match).length;
//       score += constraintMatches * 100;
//       maxScore += 3 * 100;
//     }

//     let secondaryMatchCount = 0;
//     if (filters.spendingFreeTime?.length) {
//       const listingTags = listing.spendingFreeTime?.split(',') ?? [];
//       const matchedTags = filters.spendingFreeTime.filter((tag: string) =>
//         listingTags.includes(tag)
//       );
//       secondaryMatchCount = matchedTags.length;
//       score += secondaryMatchCount;
//       maxScore += filters.spendingFreeTime.length;
//     }

//     let compatibilityStars = 0;
//     if (score === maxScore && currentUser) {
//       const userTags = currentUser.spendingFreeTime?.split(',') || [];
//       const roommateTags = listing.roommate?.flatMap((r: any) => r.spendingFreeTime?.split(',')) ?? [];
//       const uniqueTags = new Set(roommateTags);
//       const common = userTags.filter((tag: any) => uniqueTags.has(tag));
//       compatibilityStars = Math.min(common.length, 5);
//     }

//     let rating = 1;
//     if (score >= 5000) rating = 5;
//     else if (score >= 4000) rating = 4;
//     else if (score >= 3000) rating = 3;
//     else if (score >= 2000) rating = 2;

//     return {
//       ...listing,
//       matchScore: score,
//       matchScoreMax: maxScore,
//       compatibility: compatibilityStars,
//       rating,
//       searchParams,
//     };
//   });

//   const sortedListings = scoredListings.sort((a: any, b: any) => b.matchScore - a.matchScore);

//   return {
//     meta: {
//       page: Math.floor(skip / limit) + 1,
//       limit,
//       total,
//       totalPage: Math.ceil(total / limit),
//     },
//     data: sortedListings,
//   };
// };



const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000;
  const phi1 = lat1 * (Math.PI / 180);
  const phi2 = lat2 * (Math.PI / 180);
  const deltaPhi = (lat2 - lat1) * (Math.PI / 180);
  const deltaLambda = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getFilteredRoomMateListingsIntoDB = async (
  filters: any,
  { skip, limit }: { skip: number; limit: number },
  searchParams: object,
  currentUser: any = null
) => {
  const whereConditions: any = {
    rentCHF: {
      gte: Number(filters.minRent),
      lte: Number(filters.maxRent),
    },
    age: {
      gte: Number(filters.minAge),
      lte: Number(filters.maxAge),
    },
    status: 'Published',
  };

  const dateFilters: any[] = [];

  // Updated date range filtering
  if (filters?.availableFrom && filters?.lastDateOfavailable) {

    
    const fromDate = new Date(filters?.availableFrom);
    const toDate = new Date(filters?.lastDateOfavailable);

    if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      dateFilters.push({
        AND: [
          { availableFrom: { lte: toDate } },
          { lastDateOfavailable: { gte : fromDate } },
        ],
      });
    }
  }

  if (dateFilters.length > 0) {
    console.log('hello')
    whereConditions.AND = [...(whereConditions.AND || []), ...dateFilters];
  }

  if (filters.gender && filters.gender !== 'Any') {
    whereConditions.gender = filters.gender;
  }

  if (filters.language) {
    whereConditions.language = {
      contains: filters.language,
      mode: 'insensitive',
    };
  }

  if (filters.smokingAllowed && filters.smokingAllowed !== 'Any') {
    whereConditions.smokingAllowed = filters.smokingAllowed;
  }

  if (filters.pets === 'true') {
    whereConditions.newPets = {
      not: 'Not allowed',
    };
  }

  if (filters.requiredAmenities?.length > 0) {
    whereConditions.amenitiesAndServices = {
      hasEvery: filters.requiredAmenities,
    };
  }

  if (filters.spendingFreeTime?.length > 0) {
    whereConditions.spendingFreeTime = {
      contains: filters.spendingFreeTime.join(','),
      mode: 'insensitive',
    };
  }

  console.log(whereConditions,)

  const total = await prisma.listing.count({ where: whereConditions });

  const listings = await prisma.listing.findMany({
    where: whereConditions,
    include: {
      roommate: true,
      request: {
        include: {
          user: true,
        },
      },
    },
    skip,
    take: limit,
  });

  const filteredListings = listings.filter((listing) => {
    if (
      filters.location?.lat &&
      filters.location?.lng &&
      !isNaN(filters.location.lat) &&
      !isNaN(filters.location.lng)
    ) {
      const maxDistance = (filters.searchRadius ?? 15) * 1000;
      const coords = (listing.location as any)?.coordinates;
      if (!coords || coords.length !== 2) return false;

      const [lng, lat] = coords;
      const dist = getDistanceInMeters(filters.location.lat, filters.location.lng, lat, lng);
      return dist <= maxDistance;
    }
    return true;
  });

  const scoredListings = filteredListings.map((listing: any) => {
    let score = 0;
    let maxScore = 0;

    const primaryMatches = [
      listing.gender === filters.gender,
      filters.language && listing.language?.toLowerCase() === filters.language.toLowerCase(),
      filters.smokingAllowed && listing.smokingAllowed === filters.smokingAllowed,
      filters.pets === 'true' && listing.newPets !== 'Not allowed',
      filters.availableFrom && new Date(listing.availableFrom) <= new Date(filters.availableFrom),
      filters.location && listing.location,
    ];

    const primarySet = primaryMatches.filter(Boolean).length;
    score += primarySet * 1000;
    maxScore += (filters.gender ? 1000 : 0) +
      (filters.language ? 1000 : 0) +
      (filters.smokingAllowed ? 1000 : 0) +
      (filters.pets === 'true' ? 1000 : 0) +
      (filters.availableFrom ? 1000 : 0) +
      (filters.location ? 1000 : 0);

    let constraintMatches = 0;
    if (currentUser) {
      const creatorConstraints = [
        { match: listing.minAge <= currentUser.age && listing.maxAge >= currentUser.age },
        { match: listing.gender === currentUser.gender },
        {
          match: listing.language?.toLowerCase() === currentUser.language?.toLowerCase(),
        },
      ];

      constraintMatches = creatorConstraints.filter((c) => c.match).length;
      score += constraintMatches * 100;
      maxScore += 3 * 100;
    }

    let secondaryMatchCount = 0;
    if (filters.spendingFreeTime?.length) {
      const listingTags = listing.spendingFreeTime?.split(',') ?? [];
      const matchedTags = filters.spendingFreeTime.filter((tag: string) =>
        listingTags.includes(tag)
      );
      secondaryMatchCount = matchedTags.length;
      score += secondaryMatchCount;
      maxScore += filters.spendingFreeTime.length;
    }

    let compatibilityStars = 0;
    if (score === maxScore && currentUser) {
      const userTags = currentUser.spendingFreeTime?.split(',') || [];
      const roommateTags = listing.roommate?.flatMap((r: any) => r.spendingFreeTime?.split(',')) ?? [];
      const uniqueTags = new Set(roommateTags);
      const common = userTags.filter((tag: any) => uniqueTags.has(tag));
      compatibilityStars = Math.min(common.length, 5);
    }

    let rating = 1;
    if (score >= 5000) rating = 5;
    else if (score >= 4000) rating = 4;
    else if (score >= 3000) rating = 3;
    else if (score >= 2000) rating = 2;

    return {
      ...listing,
      matchScore: score,
      matchScoreMax: maxScore,
      compatibility: compatibilityStars,
      rating,
      searchParams,
    };
  });

  const sortedListings = scoredListings.sort((a: any, b: any) => b.matchScore - a.matchScore);

  return {
    meta: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: sortedListings,
  };
};




// end


const getMyRoomMateListingIntoDB = async (id:string,{ skip, limit }: { skip: number; limit: number }) => {


  const result = await prisma.listing.findMany({
    where:{userId:id},skip,
    take: limit,include:{roommate:true,request:{include:{user:{select:{id:true,firstName:true,lastName:true,email:true,phoneNumber:true}}}}}

  });
 const total = await prisma.listing.count({
    where: { userId: id },
  });

  return {
    data: result,
    total,
  };
};



const getSingleRoomMateListingIntoDB = async (id: string) => {
  const result = await prisma.listing.findFirst({
    where: { id },
    include: {
      request: true,
      roommate:true,
   
    },
  });

  if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'listing are not found!');
      }

  return result;
};


const updateSingleRoomMateListingStatusIntoDB = async (id: string,payload:any) => {

   const listing = await prisma.listing.findFirst({
    where: { id },
   
  });

  if (!listing) {
        throw new AppError(httpStatus.NOT_FOUND, 'listing are not found!');
      }

  const result = await prisma.listing.update({
    where: { id },
     data:{status:payload.status}
  });

  

  return result;
};



export const updateRoomMateListingIntoDB = async (id: string, payload: any) => {
  const listing = await prisma.listing.findFirst({
    where: { id },
  });

  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Listing not found!');
  }

  const result = await prisma.listing.update({
    where: { id },
    data: {
      ...payload, 
    },
  });

  return result;
};


export const RoomMateListingDBServices = {
  createRoomMateListingIntoDB,
  getMyRoomMateListingIntoDB,
  getFilteredRoomMateListingsIntoDB,
  getSingleRoomMateListingIntoDB,
  updateSingleRoomMateListingStatusIntoDB,
  updateRoomMateListingIntoDB

};
