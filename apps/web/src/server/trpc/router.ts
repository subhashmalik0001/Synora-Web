import { router, publicProcedure } from "./init";
import { analyticsRouter } from "./routers/analytics";
import { subscriptionRouter } from "./routers/subscription";
import { productsRouter } from "./routers/products";
import { telegramRouter } from "./routers/telegram";
import { settingsRouter } from "./routers/settings";
import { medicalRouter } from "./routers/medical";
import { authRouter } from "./routers/auth";

export const appRouter = router({
    health: publicProcedure.query(() => {
        return { status: "ok", timestamp: new Date().toISOString() };
    }),

    // ─── Feature routers ───────────────────────────────
    product: productsRouter,
    analytics: analyticsRouter,
    subscription: subscriptionRouter,
    telegram: telegramRouter,
    settings: settingsRouter,
    medical: medicalRouter,
    auth: authRouter,
});


export type AppRouter = typeof appRouter;
