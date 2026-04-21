import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@paygate/db";
import { folders } from "@paygate/db/schema";
import { eq } from "drizzle-orm";

export const foldersRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.get('/', async (req, reply) => {
        const { userId } = req.query as { userId: string };
        try {
            const data = await db.query.folders.findMany({
                where: eq(folders.userId, userId)
            });
            return reply.send(data);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch folders" });
        }
    });

    fastify.post('/', async (req, reply) => {
        const data = req.body as any;
        try {
            const [inserted] = await db.insert(folders).values({
                userId: data.userId,
                name: data.name,
                parentId: data.parentId,
                folderType: data.folderType,
            }).returning();
            return reply.send(inserted);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to create folder" });
        }
    });
};
