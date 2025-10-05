import z from "zod";

const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export type ProfileSchema = z.infer<typeof ProfileSchema>;

export default ProfileSchema;
