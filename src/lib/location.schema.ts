import { z } from "zod";

const locationSchema = z.object({
  farmName: z
    .string()
    .refine(
      (val) => val.length > 0,
      { message: "Farm name is required" }
    )
    .refine(
      (val) => val.length <= 100,
      { message: "Farm name must be less than 100 characters" }
    )
    .refine(
      (val) => {
        if (val.length === 0) return true;
        const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        return !scriptPattern.test(val);
      },
      { message: "Script tags are not allowed" }
    )
    .refine(
      (val) => {
        if (val.length === 0) return true;
        const htmlPattern = /<\/?[a-z][\s\S]*>/i;
        return !htmlPattern.test(val);
      },
      { message: "HTML tags are not allowed" }
    )
    .refine(
      (val) => {
        if (val.length === 0) return true; // Skip validation if empty
        const urlPattern = /(https?:\/\/|www\.)[^\s]+/gi;
        return !urlPattern.test(val);
      },
      { message: "URLs are not allowed" }
    ),
  
  latitude: z
    .string()
    .refine(
      (val) => val.length > 0,
      { message: "Latitude is required" }
    )
    .refine(
      (val) => {
        if (val.length === 0) return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
      },
      { message: "Latitude must be between -90 and 90" }
    ),
  
  longitude: z
    .string()
    .refine(
      (val) => val.length > 0,
      { message: "Longitude is required" }
    )
    .refine(
      (val) => {
        if (val.length === 0) return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
      },
      { message: "Longitude must be between -180 and 180" }
    ),
});

export type LocationSchema = z.infer<typeof locationSchema>;
export default locationSchema;