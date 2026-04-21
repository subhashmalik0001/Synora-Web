import { z } from "zod";

export const createUserSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().min(1).max(255).optional(),
    phone: z.string().max(20).optional(),
    authProvider: z.enum(["email", "google", "github", "telegram", "discord"]).default("email"),
    authProviderId: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const creatorOnboardSchema = z.object({
    brandName: z.string().min(1).max(255),
    slug: z
        .string()
        .min(3)
        .max(100)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    bio: z.string().max(1000).optional(),
    websiteUrl: z.string().url().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreatorOnboardInput = z.infer<typeof creatorOnboardSchema>;
