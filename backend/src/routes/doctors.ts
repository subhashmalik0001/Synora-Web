import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@paygate/db";
import { doctorProfiles } from "@paygate/db/schema";
import { eq, ilike, or } from "drizzle-orm";

export const doctorsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.get('/', async (req, reply) => {
        const { q, specialization } = req.query as { q?: string; specialization?: string };
        try {
            // Basic search implementation
            const data = await db.query.doctorProfiles.findMany({
                where: q ? ilike(doctorProfiles.fullName, `%${q}%`) : undefined
                // add specialization filter logic here
            });
            return reply.send(data);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch doctors" });
        }
    });

    fastify.get('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        try {
            const data = await db.query.doctorProfiles.findFirst({
                where: eq(doctorProfiles.userId, id)
            });
            return reply.send(data);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch doctor profile" });
        }
    });

    fastify.get('/:id/slots', async (req, reply) => {
        const { id } = req.params as { id: string };
        const { date } = req.query as { date: string };
        // Logic to calculate available time slots for a specific date
        const mockSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];
        return reply.send(mockSlots);
    });
};
