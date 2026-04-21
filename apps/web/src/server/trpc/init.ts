import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { headers } from "next/headers";
import { db } from "@paygate/db";

import { createClient } from "@/lib/supabase/server";

export const createContext = async () => {
    try {
        console.log("[TRPC_CONTEXT_INIT] 🔍 Initializing request context...");
        
        // 1. Check Supabase Configuration
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error("[TRPC_CONTEXT_ERROR] ❌ Supabase environment variables are missing!");
        }

        const supabase = createClient();
        
        let user = null;
        try {
            const { data } = await supabase.auth.getUser();
            user = data?.user;
            console.log("[TRPC_CONTEXT_AUTH] 👤 User identified:", user?.id || "None");
        } catch (authError: any) {
            console.error("[TRPC_CONTEXT_ERROR] ❌ Supabase Auth failed during context initialization:", authError.message);
        }

        // 2. Check Database availability
        if (!db) {
            console.error("[TRPC_CONTEXT_ERROR] ❌ Database instance is undefined!");
        }

        return {
            user: user ? {
                id: user.id,
                name: user.user_metadata?.full_name || user.email,
                email: user.email,
                role: user.user_metadata?.role || "patient",
                isOnboarded: !!user.user_metadata?.isOnboarded,
            } : null,
            db,
            supabase, // Now exposed for mutations to update metadata
        };
    } catch (criticalError: any) {
        console.error("[TRPC_CONTEXT_CRITICAL_CRASH] 🚨 Failed to create request context:", criticalError.message);
        
        // Return a shell context to prevent a total server 500 HTML crash
        return {
            user: null,
            db: db,
            _error: criticalError.message
        };
    }
};



export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to enforce authentication
const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource",
        });
    }
    return next({
        ctx: {
            user: ctx.user,
        },
    });
});

export const protectedProcedure = t.procedure.use(isAuthed);

