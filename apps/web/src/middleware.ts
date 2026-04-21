import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });
    let user = null;

    try {
        const result = await updateSession(request);
        supabaseResponse = result.supabaseResponse;
        user = result.user;
    } catch (error: any) {
        console.error("[MIDDLEWARE_CRITICAL_ERROR] 🚨 Middleware crash:", error.message);
        // Continue with a default response to prevent 500 HTML error pages
    }

    const { pathname } = request.nextUrl;

    // 1. Home page / Landing
    if (pathname === "/") return supabaseResponse;

    // 2. Onboarding Status Check (Metadata-driven for speed)
    const isOnboarded = !!user?.user_metadata?.isOnboarded;
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
    const isOnboardingPage = pathname.startsWith("/onboarding");
    const isDashboardPage = pathname.startsWith("/patient") || pathname.startsWith("/doctor") || pathname.startsWith("/dashboard");

    // Case A: Not logged in - force to login for protected routes
    if (!user && (isOnboardingPage || isDashboardPage)) {
        return Response.redirect(new URL("/login", request.url));
    }

    // Case B: Logged in but NOT onboarded
    if (user && !isOnboarded) {
        // Force them to stay on /onboarding unless they are trying to sign out
        if (!isOnboardingPage && !isAuthPage) {
            console.log("[MIDDLEWARE_REDIRECT] 🚀 Forcing onboarding for user", user.id);
            return Response.redirect(new URL("/onboarding", request.url));
        }
        return supabaseResponse;
    }

    // Case C: Logged in and IS onboarded
    if (user && isOnboarded) {
        // Prevent them from going back to login/signup/onboarding
        if (isAuthPage || isOnboardingPage) {
            return Response.redirect(new URL("/dashboard", request.url));
        }

        // Role-based redirection for /dashboard
        if (pathname === "/dashboard") {
            const role = user.user_metadata?.role || "patient";
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
