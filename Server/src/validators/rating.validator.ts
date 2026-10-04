import { z } from "zod";

export const ratingInputSchema = z.object({
  body: z.object({
    rating: z
      .number()
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
  }),
});

export type RatingInput = z.infer<typeof ratingInputSchema>["body"];
