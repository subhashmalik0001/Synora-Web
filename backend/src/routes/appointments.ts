import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@paygate/db";
import { appointments } from "@paygate/db/schema";
import { eq, desc, and, or } from "drizzle-orm";

export const appointmentsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.post('/book', async (req, reply) => {
        const data = req.body as any;
        try {
            const [inserted] = await db.insert(appointments).values({
                doctorId: data.doctorId,
                patientId: data.patientId,
                appointmentDate: data.appointmentDate,
                timeSlot: data.timeSlot,
                mode: data.mode,
                reason: data.reason,
                status: 'booked',
            }).returning();
            return reply.send(inserted);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to book appointment" });
        }
    });

    fastify.patch('/:id/status', async (req, reply) => {
        const { id } = req.params as { id: string };
        const { status, cancellationReason } = req.body as { status: string; cancellationReason?: string };
        try {
            const [updated] = await db.update(appointments)
                .set({ status, cancellationReason })
                .where(eq(appointments.id, id))
                .returning();
            return reply.send(updated);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to update appointment status" });
        }
    });

    fastify.get('/', async (req, reply) => {
        const { userId, role } = req.query as { userId: string; role: 'patient' | 'doctor' };
        try {
            const data = await db.query.appointments.findMany({
                where: role === 'patient' 
                    ? eq(appointments.patientId, userId)
                    : eq(appointments.doctorId, userId),
                orderBy: [desc(appointments.appointmentDate)],
                with: {
                    // Assuming relations are set up in db package later
                    // patient: true,
                    // doctor: true,
                }
            });
            return reply.send(data);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch appointments" });
        }
    });
};
