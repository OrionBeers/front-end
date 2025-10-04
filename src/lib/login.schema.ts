import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default loginSchema;
export type LoginSchema = z.infer<typeof loginSchema>;
