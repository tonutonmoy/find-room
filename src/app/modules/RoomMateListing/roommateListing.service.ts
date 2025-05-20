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

    console.log(result, 'Listing with roommates created');
    return result;
  } catch (error) {
    console.error('Error creating listing with roommates:', error);
    throw error;
  }
};
// ____________



const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Earth radius in meters
  const phi1 = lat1 * (Math.PI / 180);
  const phi2 = lat2 * (Math.PI / 180);
  const deltaPhi = (lat2 - lat1) * (Math.PI / 180);
  const deltaLambda = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const getFilteredRoomMateListingsIntoDB = async (
  filters: any,
  { skip, limit }: { skip: number; limit: number },searchParams:object
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

  if (filters.availableFrom) {
    const date = new Date(filters.availableFrom);
    if (!isNaN(date.getTime())) {
      whereConditions.availableFrom = { lte: date };
    }
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

  const listings = await prisma.listing.findMany({
    where: whereConditions,
    include: {
      roommate: true,
      request: {
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
        },
      },
    },
  });

  let filteredListings = listings;

  // ✅ Geo Filter
  if (
    filters.location?.lat &&
    filters.location?.lng &&
    !isNaN(filters.location.lat) &&
    !isNaN(filters.location.lng)
  ) {
    const maxDistance = (filters.searchRadius ?? 10) * 1000;
    filteredListings = listings.filter((listing) => {
      const coords = (listing.location as any)?.coordinates;
      if (!coords || coords.length !== 2) return false;

      const [lng, lat] = coords;
      const dist = getDistanceInMeters(
        filters.location.lat,
        filters.location.lng,
        lat,
        lng
      );

      return dist <= maxDistance;
    });
  }

  const scoredListings = filteredListings.map((listing: any) => {
    let score = 0;

    // Primary filters — 1000 points
    if (listing.gender === filters.gender) score += 1000;
    if (
      filters.language &&
      listing.language?.toLowerCase() === filters.language.toLowerCase()
    ) score += 1000;
    if (
      filters.smokingAllowed &&
      listing.smokingAllowed === filters.smokingAllowed
    ) score += 1000;
    if (filters.pets === 'true' && listing.newPets !== 'Not allowed')
      score += 1000;

    // Constraint filters — 100 points
    if (filters.requiredAmenities?.length) {
      const matched = filters.requiredAmenities.every((a: any) =>
        listing.amenitiesAndServices.includes(a)
      );
      if (matched) score += 100;
    }

    if (filters.availableFrom) {
      const available = new Date(listing.availableFrom);
      const required = new Date(filters.availableFrom);
      if (available <= required) score += 100;
    }

    // Secondary filters — 1 point each
    if (filters.spendingFreeTime?.length) {
      const listingTags = listing.spendingFreeTime?.split(',') ?? [];
      const matchedTags = filters.spendingFreeTime.filter((tag: any) =>
        listingTags.includes(tag)
      );
      score += matchedTags.length;
    }

    // ✅ Rating based on matchScore only
    let rating = 1;
    if (score >= 4000) rating = 5;
    else if (score >= 3000) rating = 4;
    else if (score >= 2000) rating = 3;
    else if (score >= 1000) rating = 2;

    return {
      ...listing,
      matchScore: score,
      rating,
      searchParams
    };
  });

  const sorted = scoredListings.sort((a: any, b: any) => b.matchScore - a.matchScore);
  const paginated = sorted.slice(skip, skip + limit);

  return {
    data: paginated,
    total: scoredListings.length,
  };
};



// -----------------------

// strat

// const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
//   const R = 6371000; // Earth radius in meters
//   const phi1 = lat1 * (Math.PI / 180); // Convert latitude from degrees to radians
//   const phi2 = lat2 * (Math.PI / 180); // Convert latitude from degrees to radians
//   const deltaPhi = (lat2 - lat1) * (Math.PI / 180); // Difference in latitude
//   const deltaLambda = (lon2 - lon1) * (Math.PI / 180); // Difference in longitude

//   const a =
//     Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
//     Math.cos(phi1) * Math.cos(phi2) *
//     Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c; // Distance in meters

//   return distance;
// };

// export const getFilteredRoomMateListingsIntoDB = async (
//   filters: any,
//   { skip, limit }: any
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

//   const listings = await prisma.listing.findMany({
//     where: whereConditions,
//     include: {
//       roommate:true,
//       request: {
//         include: {
//           user: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               email: true,
//               phoneNumber: true,
//               // interestTags: true, // Only include if defined in Prisma schema
//             },
//           },
//         },
//       },
//     },
//   });

//   let filteredListings:any = listings;

//   // ✅ GeoJSON Distance Filter
//   if (
//     filters.location?.lat &&
//     filters.location?.lng &&
//     !isNaN(filters.location.lat) &&
//     !isNaN(filters.location.lng)
//   ) {
//     const maxDistance = (filters.searchRadius ?? 10) * 1000;
//     filteredListings = listings.filter((listing) => {
//      const coords = (listing.location as any)?.coordinates;
//       if (!coords || coords.length !== 2) return false;

//       const [lng, lat] = coords;

//       const dist = getDistanceInMeters(
//         filters.location.lat,
//         filters.location.lng,
//         lat,
//         lng
//       );

//       return dist <= maxDistance;
//     });
//   }

//   // Matching Score Calculation
//   const scoredListings = filteredListings.map((listing:any) => {
//     let score = 0;

//     // 🧠 Primary Filters — 1000 pts each
//     if (listing.gender === filters.gender) score += 1000;
//     if (
//       filters.language &&
//       listing.language?.toLowerCase() === filters.language.toLowerCase()
//     )
//       score += 1000;
//     if (
//       filters.smokingAllowed &&
//       listing.smokingAllowed === filters.smokingAllowed
//     )
//       score += 1000;
//     if (filters.pets === 'true' && listing.newPets !== 'Not allowed')
//       score += 1000;

//     // 🧱 Constraints — 100 pts each
//     if (filters.requiredAmenities?.length) {
//       const matched = filters.requiredAmenities.every((a:any) =>
//         listing.amenitiesAndServices.includes(a)
//       );
//       if (matched) score += 100;
//     }

//     if (filters.availableFrom) {
//       const available = new Date(listing.availableFrom);
//       const required = new Date(filters.availableFrom);
//       if (available <= required) score += 100;
//     }

//     // 🧩 Secondary — 1 pt each
//     if (filters.spendingFreeTime?.length) {
//       const listingTags = listing.spendingFreeTime?.split(',') ?? [];
//       const matchedTags = filters.spendingFreeTime.filter((tag:any) =>
//         listingTags.includes(tag)
//       );
//       score += matchedTags.length;
//     }

//     // 🌟 Compatibility Score
//     let rating = 0;
//     if (
//       filters.spendingFreeTime?.length &&
//       listing.request?.user?.spendingFreeTime
//     ) {
//       const roommateInterests = listing.request.user.spendingFreeTime.split(',');
//       const common = filters.spendingFreeTime.filter((tag:any) =>
//         roommateInterests.includes(tag)
//       );
//       rating = Math.min(common.length, 5); // 0–5 stars
//     }

//     return {
//       ...listing,
//       matchScore: score,
//       rating,
//     };
//   });

//   const sorted = scoredListings.sort((a:any, b:any) => b.matchScore - a.matchScore);
//   const paginated = sorted.slice(skip, skip + limit);

//   return {
//     data: paginated,
//     total: scoredListings.length,
//   };
// };

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



export const RoomMateListingDBServices = {
  createRoomMateListingIntoDB,
  getMyRoomMateListingIntoDB,
  getFilteredRoomMateListingsIntoDB,
  getSingleRoomMateListingIntoDB

};
