import { z } from "zod";

export const checkoutSchema = z.object({
    productId: z.string().uuid(),
    gateway: z.enum(["razorpay", "stripe"]),
    couponCode: z.string().optional(),
    affiliateCode: z.string().optional(),
});

export const webhookHeaderSchema = z.object({
    "x-razorpay-signature": z.string().optional(),
    "stripe-signature": z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
