import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@paygate/db";
import { medicationReminders } from "@paygate/db/schema";
import { eq } from "drizzle-orm";

export const remindersRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.get('/', async (req, reply) => {
        const { userId } = req.query as { userId: string };
        try {
            const data = await db.query.medicationReminders.findMany({
                where: eq(medicationReminders.userId, userId)
            });
            return reply.send(data);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch reminders" });
        }
    });

    fastify.post('/', async (req, reply) => {
        const data = req.body as any;
        try {
            const [inserted] = await db.insert(medicationReminders).values({
                userId: data.userId,
                prescriptionId: data.prescriptionId,
                medicineName: data.medicineName,
                dose: data.dose,
                reminderTime: data.reminderTime,
                daysOfWeek: data.daysOfWeek,
                isActive: true,
            }).returning();
            return reply.send(inserted);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to create reminder" });
        }
    });

    fastify.patch('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        const { isActive } = req.body as { isActive: boolean };
        try {
            const [updated] = await db.update(medicationReminders)
                .set({ isActive })
                .where(eq(medicationReminders.id, id))
                .returning();
            return reply.send(updated);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to toggle reminder" });
        }
    });

    fastify.delete('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };
        try {
            await db.delete(medicationReminders).where(eq(medicationReminders.id, id));
            return reply.send({ success: true });
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to delete reminder" });
        }
    });
};
