import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });
    let user = null;

    try {
        // Check for dummy auth cookie first for "Demo Mode"
        const dummyAuth = request.cookies.get("synora_dummy_auth");
        if (dummyAuth?.value === "true") {
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
            const result = await updateSession(request);
            supabaseResponse = result.supabaseResponse;
            user = result.user;
        }
    } catch (error: any) {
        console.error("[MIDDLEWARE_CRITICAL_ERROR] 🚨 Middleware crash:", error.message);
        // Continue with a default response to prevent 500 HTML error pages
    }

    const { pathname } = request.nextUrl;

    // 1. Home page / Landing / API routes / static files
    if (pathname === "/" || pathname.startsWith("/api") || pathname.startsWith("/_next")) {
        return supabaseResponse;
    }

    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
    const isDashboardPage = pathname.startsWith("/patient") || pathname.startsWith("/doctor") || pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

    // Case A: Not logged in - force to login for protected routes
    if (!user && isDashboardPage) {
        return Response.redirect(new URL("/login", request.url));
    }

    // Case B: Logged in
    if (user) {
        const role = user.user_metadata?.role || "patient";

        // Prevent them from going back to login/signup/onboarding
        if (isAuthPage || pathname.startsWith("/onboarding")) {
            return Response.redirect(new URL(`/${role}`, request.url));
        }

        // Role-based redirection for /dashboard
        if (pathname === "/dashboard") {
            return Response.redirect(new URL(`/${role}`, request.url));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
