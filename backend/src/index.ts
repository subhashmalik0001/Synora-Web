import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

import { healthRoutes } from "./routes/health.js";
import { aiRoutes } from "./routes/ai.js";
import { vitalsRoutes } from "./routes/vitals.js";
import { appointmentsRoutes } from "./routes/appointments.js";
import { recordsRoutes } from "./routes/records.js";
import { doctorsRoutes } from "./routes/doctors.js";
import { accessRoutes } from "./routes/access.js";
import { foldersRoutes } from "./routes/folders.js";
import { remindersRoutes } from "./routes/reminders.js";

const app = Fastify({
    logger: {
        level: process.env.LOG_LEVEL || "info",
        transport:
            process.env.NODE_ENV === "development"
                ? { target: "pino-pretty" }
                : undefined,
    },
});

// ─── Plugins ─────────────────────────────────────────
await app.register(cors, {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
});
await app.register(helmet);

// ─── Routes ──────────────────────────────────────────
await app.register(healthRoutes, { prefix: "/" });
await app.register(aiRoutes, { prefix: "/api/ai" });
await app.register(vitalsRoutes, { prefix: "/api/vitals" });
await app.register(appointmentsRoutes, { prefix: "/api/appointments" });
await app.register(recordsRoutes, { prefix: "/api/records" });
await app.register(doctorsRoutes, { prefix: "/api/doctors" });
await app.register(accessRoutes, { prefix: "/api/access" });
await app.register(foldersRoutes, { prefix: "/api/folders" });
await app.register(remindersRoutes, { prefix: "/api/reminders" });

// ─── Start ───────────────────────────────────────────
const port = Number(process.env.API_PORT) || 4000;
const host = process.env.API_HOST || "0.0.0.0";

try {
    await app.listen({ port, host });
    console.info(`🚀 API server running on http://${host}:${port}`);
} catch (err) {
    app.log.error(err);
    process.exit(1);
}
