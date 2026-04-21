import { z } from "zod";
import { router, publicProcedure } from "../init";
import { createAdminClient } from "@/lib/supabase/admin";

export const authRouter = router({
    signup: publicProcedure
        .input(z.object({
            email: z.string().email(),
            password: z.string().min(8),
            name: z.string(),
            role: z.enum(["doctor", "patient"]),
        }))
        .mutation(async ({ input }) => {
            const admin = createAdminClient();

            // Create user with auto-confirm
            const { data, error } = await admin.auth.admin.createUser({
                email: input.email,
                password: input.password,
                email_confirm: true,
                user_metadata: {
                    full_name: input.name,
                    role: input.role,
                    isOnboarded: true
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            return { success: true, user: data.user };
        }),
});
