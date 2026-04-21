import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@paygate/db";
import { healthVitals } from "@paygate/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { subDays, subMonths } from "date-fns";

export const vitalsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.post('/', async (req, reply) => {
        const data = req.body as any;
        try {
            const [inserted] = await db.insert(healthVitals).values({
                patientId: data.patientId,
                weightKg: data.weightKg,
                heightCm: data.heightCm,
                bloodPressureSystolic: data.bloodPressureSystolic,
                bloodPressureDiastolic: data.bloodPressureDiastolic,
                heartRate: data.heartRate,
                bloodGlucose: data.bloodGlucose,
                temperatureC: data.temperatureC,
                spo2: data.spo2,
                notes: data.notes,
            }).returning();
            return reply.send(inserted);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to log vitals" });
        }
    });

    fastify.get('/:patientId', async (req, reply) => {
        const { patientId } = req.params as { patientId: string };
        const { period } = req.query as { period?: '1W' | '1M' | '3M' | '6M' };

        let startDate = subMonths(new Date(), 1);
        if (period === '1W') startDate = subDays(new Date(), 7);
        if (period === '1M') startDate = subMonths(new Date(), 1);
        if (period === '3M') startDate = subMonths(new Date(), 3);
        if (period === '6M') startDate = subMonths(new Date(), 6);

        try {
            const data = await db.query.healthVitals.findMany({
                where: and(
                    eq(healthVitals.patientId, patientId),
                    gte(healthVitals.recordedAt, startDate)
                ),
                orderBy: [desc(healthVitals.recordedAt)]
            });
            return reply.send(data);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch vitals" });
        }
    });
};
