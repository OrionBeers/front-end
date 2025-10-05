import z from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.email("Invalid email address").max(100, "Email is too long"),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

export default profileSchema;
