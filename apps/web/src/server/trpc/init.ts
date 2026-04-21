import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { db } from "@paygate/db";
import { createClient } from "@/lib/supabase/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
    try {
        console.log("[TRPC_CONTEXT_INIT] 🔍 Initializing request context...");
        
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error("[TRPC_CONTEXT_ERROR] ❌ Supabase environment variables are missing!");
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("[TRPC_CONTEXT_ERROR] ❌ GEMINI_API_KEY is missing! AI features will fail.");
        }

        const supabase = createClient();
        const cookieStore = opts.req.headers.get("cookie") || "";
        const isDemoMode = cookieStore.includes("synora_dummy_auth=true");
        
        let user = null;

        if (isDemoMode) {
            console.log("[TRPC_CONTEXT_AUTH] 🛡️ Demo Mode detected via cookie");
            user = {
                id: "dummy-user-id",
                user_metadata: {
                    full_name: "Demo User",
                    role: "doctor",
                    isOnboarded: true,
                },
                email: "demo@synora.com",
            };
        } else {
            try {
                const { data } = await supabase.auth.getUser();
                user = data?.user;
                console.log("[TRPC_CONTEXT_AUTH] 👤 User identified:", user?.id || "None");
            } catch (authError: any) {
                console.error("[TRPC_CONTEXT_ERROR] ❌ Supabase Auth failed during context initialization:", authError.message);
            }
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
            isDemoMode,
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

