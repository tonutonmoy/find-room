import { z } from 'zod';

const requestValidation = z.object({
  body: z.object({
    listingId: z.string({
      required_error: 'Listing ID is required!',
    }),
    matchScore: z.number({
      required_error: 'matchScore is required!',
    }).optional(),
    rating: z.number({
      required_error: 'rating is required!',
    }),
    searchParams: z.record(z.any(), {
      required_error: 'searchParams is required!',
    }).optional(),
  }),
});

export const RequestValidation = { requestValidation };
