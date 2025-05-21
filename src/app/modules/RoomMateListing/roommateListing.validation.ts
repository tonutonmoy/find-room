import { z } from 'zod';

// Listing Validation Schema
const listingValidation = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required!',
    }),
   
  
    description: z.string({
      required_error: 'Description is required!',
    }),
    preview: z.string({
   required_error: 'Preview is required!',
    }),
    streetNumber: z.string({
      required_error: 'Street number is required!',
    }),
    postCode: z.string({
      required_error: 'Post code is required!',
    }),
    city: z.string({
      required_error: 'City is required!',
    }),
    floor: z.number({
      required_error: 'Floor number is required!',
    }),
    rooms: z.number({
      required_error: 'Rooms count is required!',
    }),
    bathrooms: z.number({
      required_error: 'Bathrooms count is required!',
    }),
    size: z.number({
      required_error: 'Size is required!',
    }),
    availableFrom: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format for availableFrom!',
    }),
    rentCHF: z.number({
      required_error: 'Rent (CHF) is required!',
    }),
    amenitiesAndServices: z.array(z.string(), {
      required_error: 'Amenities and services are required!',
    }),
    additionalExpenses: z.boolean(),
    houseAtmosphere: z.string(),
    externalGuests: z.string(),
    smokingAllowed: z.string(),
    clearScheduleDefine: z.string(),
    currentyPets: z.string(),
    newPets: z.string(),
    cooking: z.string(),
    dinner: z.string(),
    spendingFreeTime: z.string(),
    language: z.string(),
    age: z.number(),
    gender: z.string(),
    status: z.enum(['Published', 'Expired', 'Deactivated']),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number(), z.number()]),
    }),

    roommate: z.array(
      z.object({
        image: z.string().url({
          message: 'Image must be a valid URL!',
        }),
        email: z.string().email({
          message: 'Invalid email format!',
        }),
        firstName: z.string({
          required_error: 'First name is required!',
        }),
        lastName: z.string({
          required_error: 'Last name is required!',
        }),
        dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: 'Invalid date format for dateOfBirth!',
        }),
        languageSpoken: z.string({
          required_error: 'Language spoken is required!',
        }),
        age: z.number(),
        gender: z.string(),
        interests: z.array(z.string()),
        university: z.string(),
        instagram: z.string().optional(),
      })
    ),
  }),
});

export const RoomMateListingValidation = { listingValidation };
