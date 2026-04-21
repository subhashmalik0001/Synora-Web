import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@paygate/db";
import { healthSummaries } from "@paygate/db/schema";
import { eq } from "drizzle-orm";

export const aiRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    fastify.post('/parse', async (req, reply) => {
        const { file_url, type } = req.body as { file_url: string; type: 'prescription' | 'lab_report' };

        const prompt = type === 'prescription' ? `
    Extract from this prescription image and return ONLY valid JSON:
    {
      "doctor_name": string,
      "clinic_name": string,
      "detected_specialization": string,
      "prescription_date": "YYYY-MM-DD",
      "diagnosis": string,
      "summary": string,
      "medicines": [{ "name": string, "dosage": string, "frequency": string, "duration": string, "instructions": string }],
      "confidence": number
    }` : `
    Extract from this lab report and return ONLY valid JSON:
    {
      "test_name": string,
      "lab_name": string,
      "report_date": "YYYY-MM-DD",
      "biomarkers": [{ "name": string, "value": number, "unit": string, "normal_min": number, "normal_max": number }],
      "is_critical": boolean,
      "confidence": number
    }`;

        const qwenUrl = process.env.QWEN_API_URL;
        const qwenKey = process.env.QWEN_API_KEY;

        if (!qwenUrl || !qwenKey) {
            return reply.status(500).send({ error: "AI service configuration missing" });
        }

        try {
            const response = await fetch(qwenUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${qwenKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'qwen-vl-max',
                    messages: [{
                        role: 'user',
                        content: [
                            { type: 'image_url', image_url: { url: file_url } },
                            { type: 'text', text: prompt }
                        ]
                    }]
                })
            });

            const result = await response.json() as any;
            const content = result.choices[0].message.content;
            
            // Extract JSON from potential markdown blocks
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
            
            return reply.send(parsed);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Failed to parse document with AI" });
        }
    });

    fastify.post('/health-summary', async (req, reply) => {
        // Placeholder for AI health summary generation
        return reply.send({ summary: "AI Health Summary generation pending implementation" });
    });

    fastify.post('/report-summary', async (req, reply) => {
        // Placeholder for single report AI narrative
        return reply.send({ narrative: "Report summary pending implementation" });
    });
};
