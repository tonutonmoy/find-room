import { z } from 'zod';
const requestValidation = z.object({
  body: z.object({
   
    listingId: z.string({
      required_error: 'Listing ID is required!',
    }),
 
  }),
});

export const RequestValidation = { requestValidation };
