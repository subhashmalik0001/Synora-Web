import { GoogleGenerativeAI } from "@google/generative-ai";

// Legacy config for components still using the old endpoint
export const AI_CONFIG = {
    baseUrl: "https://api5.cuai.space",
    endpoints: {
        generate: "/api/generate",
        chat: "/api/chat",
        v1Models: "/v1/models",
    }
};

export interface AIAnalysisResult {
    type: 'prescription' | 'lab_report';
    summary: string;
    details: {
        clinicName?: string;
        doctorName?: string;
        date?: string;
        diagnosis?: string;
        medicines?: Array<{
            name: string;
            dosage: string;
            frequency: string;
            duration: string;
            instructions: string;
        }>;
        specialization?: string;
        labName?: string;
        testName?: string;
        biomarkers?: Array<{
            name: string;
            value: number;
            unit: string;
            normal_min: number;
            normal_max: number;
        }>;
        isCritical?: boolean;
    };
    confidence: number;
}

const SYSTEM_PROMPT = `You are an expert medical document parser. Carefully analyze this medical document image or PDF and extract structured data. You MUST try your absolute best to read and transcribe handwritten text, especially medication names, dosages, and medical shorthand (e.g., Rx, bd, od, tid).

If it is a PRESCRIPTION, return JSON:
{
  "type": "prescription",
  "clinic_name": "",
  "doctor_name": "",
  "date": "",
  "diagnosis": "",
  "medicines": [
    { 
      "name": "Exact medicine name (transcribe handwriting carefully)", 
      "dosage": "e.g., 500mg, 10ml", 
      "frequency": "e.g., 1-0-1, twice a day (decode shorthand like bd/tid)", 
      "duration": "e.g., 5 days", 
      "instructions": "e.g., after meals (decode shorthand like p.c./a.c.)" 
    }
  ],
  "specialization": "",
  "ai_confidence": 0.0
}

If it is a LAB REPORT, return JSON:
{
  "type": "lab_report",
  "lab_name": "",
  "doctor_name": "",
  "date": "",
  "test_name": "",
  "biomarkers": [
    { "name": "", "value": 0, "unit": "", "normal_min": 0, "normal_max": 0 }
  ],
  "is_critical": false,
  "ai_confidence": 0.0
}

Return ONLY valid JSON. No markdown, no explanation.`;

const PRIMARY_KEY = "AIzaSyBwTdJXJ7ZlQFlxRpSPWrt_g_k-5F_RSS0";
const FALLBACK_KEY = "AIzaSyBmmBYWb4yiLmZzL4pF3lYALqqTQUO1Ink";

export async function analyzeMedicalImage(imageUrl: string): Promise<AIAnalysisResult> {
    const GoogleGenerativeAI = (await import("@google/generative-ai")).GoogleGenerativeAI;
    
    // Helper to attempt generation with a specific key
    const tryGenerate = async (apiKey: string) => {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const imageResp = await fetch(imageUrl);
        if (!imageResp.ok) throw new Error(`Failed to fetch image: ${imageResp.status}`);
        const imageBuffer = await imageResp.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const mimeType = (imageResp.headers.get('content-type') || 'image/jpeg').split(';')[0];

        const result = await model.generateContent([
            SYSTEM_PROMPT,
            { inlineData: { data: base64Image, mimeType } }
        ]);

        return result.response.text();
    };

    let text = "";
    try {
        // Try Primary Key first
        text = await tryGenerate(PRIMARY_KEY);
    } catch (error: any) {
        console.warn("Primary Gemini Key failed, attempting fallback...", error.message);
        try {
            // Try Fallback Key
            text = await tryGenerate(FALLBACK_KEY);
        } catch (fallbackError: any) {
            console.error("Fallback Gemini Key also failed.", fallbackError.message);
            throw fallbackError;
        }
    }

    try {
        // Safely strip any markdown fences before parsing
        const cleanJson = text
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();
        
        const parsed = JSON.parse(cleanJson);

        // Auto-detect is_critical: set true if any biomarker is outside normal range
        let isCritical = parsed.is_critical || false;
        if (parsed.type === 'lab_report' && Array.isArray(parsed.biomarkers)) {
            isCritical = parsed.biomarkers.some((b: any) => {
                const val = Number(b.value);
                const min = Number(b.normal_min);
                const max = Number(b.normal_max);
                if (isNaN(val) || isNaN(min) || isNaN(max)) return false;
                return val < min || val > max;
            });
        }

        const confidence = Number(parsed.ai_confidence) || 0.95;

        if (parsed.type === 'prescription') {
            return {
                type: 'prescription',
                summary: `Prescription from ${parsed.clinic_name || 'clinic'} — ${parsed.diagnosis || 'diagnosis pending'}.`,
                details: {
                    clinicName: parsed.clinic_name || '',
                    doctorName: parsed.doctor_name || '',
                    date: parsed.date || '',
                    diagnosis: parsed.diagnosis || '',
                    medicines: parsed.medicines || [],
                    specialization: parsed.specialization || '',
                },
                confidence,
            };
        } else {
            return {
                type: 'lab_report',
                summary: `Lab report from ${parsed.lab_name || 'laboratory'} — ${parsed.test_name || 'test results'}.${isCritical ? ' ⚠️ Critical values detected.' : ''}`,
                details: {
                    labName: parsed.lab_name || '',
                    doctorName: parsed.doctor_name || '',
                    date: parsed.date || '',
                    testName: parsed.test_name || '',
                    biomarkers: parsed.biomarkers || [],
                    isCritical,
                },
                confidence,
            };
        }

    } catch (error: any) {
        console.error("GEMINI_ANALYSIS_ERROR:", error.message);

        // Handle Rate Limit (429) — Vault Fallback so data is never lost
        if (error.message?.includes("429") || error.message?.includes("quota")) {
            console.warn("⚠️ AI Quota Reached: Using Vault Fallback");
            return {
                type: 'lab_report',
                summary: "Document safely stored. AI analysis will resume when quota resets.",
                details: {
                    labName: "My Medical Vault",
                    date: new Date().toISOString().split('T')[0],
                    biomarkers: [],
                    isCritical: false,
                },
                confidence: 0.5,
            };
        }

        // Handle invalid JSON parse errors — fallback instead of crash
        if (error instanceof SyntaxError) {
            console.warn("⚠️ AI returned invalid JSON — using fallback");
            return {
                type: 'lab_report',
                summary: "Document stored. AI could not parse the content clearly.",
                details: {
                    labName: "My Medical Vault",
                    date: new Date().toISOString().split('T')[0],
                    biomarkers: [],
                    isCritical: false,
                },
                confidence: 0.4,
            };
        }

        throw error;
    }
}
