import z from "zod";

const searchSchema = z.object({
  crop: z.string().min(1, "Crop is required"),
  location: z.string().min(1, "Location is required"),
  month: z.enum([
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ]),
});

export type SearchSchema = z.infer<typeof searchSchema>;

export default searchSchema;
