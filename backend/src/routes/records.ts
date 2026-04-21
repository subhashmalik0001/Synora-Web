import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@paygate/db";
import { prescriptions, labReports } from "@paygate/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const recordsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.post('/upload', async (req, reply) => {
        // This would typically involve Supabase storage logic or similar
        // For now, return a mock success
        return reply.send({ success: true, url: "mock_file_url" });
    });

    fastify.get('/', async (req, reply) => {
        const { userId } = req.query as { userId: string };
        try {
            const p = await db.query.prescriptions.findMany({
                where: eq(prescriptions.userId, userId),
                orderBy: [desc(prescriptions.createdAt)]
            });
            const l = await db.query.labReports.findMany({
                where: eq(labReports.userId, userId),
                orderBy: [desc(labReports.createdAt)]
            });
            return reply.send({ prescriptions: p, labReports: l });
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch records" });
        }
    });

    fastify.get('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        const { type } = req.query as { type: 'prescription' | 'lab_report' };
        try {
            const data = type === 'prescription' 
                ? await db.query.prescriptions.findFirst({ where: eq(prescriptions.id, id) })
                : await db.query.labReports.findFirst({ where: eq(labReports.id, id) });
            return reply.send(data);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch record" });
        }
    });

    fastify.delete('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        const { type } = req.query as { type: 'prescription' | 'lab_report' };
        try {
            if (type === 'prescription') {
                await db.delete(prescriptions).where(eq(prescriptions.id, id));
            } else {
                await db.delete(labReports).where(eq(labReports.id, id));
            }
            return reply.send({ success: true });
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to delete record" });
        }
    });
};
