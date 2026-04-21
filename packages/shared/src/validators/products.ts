import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    type: z.enum(["membership", "course", "digital_download", "one_time"]),
    pricePaise: z.number().int().min(0).default(0),
    priceCents: z.number().int().min(0).default(0),
    currency: z.enum(["INR", "USD", "EUR", "GBP"]).default("INR"),
    billingInterval: z
        .enum(["monthly", "quarterly", "yearly", "one_time", "lifetime"])
        .default("monthly"),
    trialDays: z.number().int().min(0).default(0),
    slug: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    coverImageUrl: z.string().url().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
