import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@paygate/db";
import { accessRequests } from "@paygate/db/schema";
import { eq, desc } from "drizzle-orm";

export const accessRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.post('/request', async (req, reply) => {
        const data = req.body as any;
        try {
            const [inserted] = await db.insert(accessRequests).values({
                patientId: data.patientId,
                doctorId: data.doctorId,
                status: 'pending',
                message: data.message,
            }).returning();
            return reply.send(inserted);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to send access request" });
        }
    });

    fastify.patch('/:id/review', async (req, reply) => {
        const { id } = req.params as { id: string };
        const { status } = req.body as { status: 'approved' | 'rejected' };
        try {
            const [updated] = await db.update(accessRequests)
                .set({ status, reviewedAt: new Date() })
                .where(eq(accessRequests.id, id))
                .returning();
            return reply.send(updated);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to review access request" });
        }
    });
};
