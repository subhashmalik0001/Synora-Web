import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { 
    profiles, 
    doctorProfiles, 
    appointments, 
    healthVitals, 
    folders, 
    labReports, 
    prescriptions,
    users
} from "@paygate/db";
import { analyzeMedicalImage, AI_CONFIG } from "@/lib/ai/client";
import { router, protectedProcedure } from "../init";
import { createAdminClient } from "@/lib/supabase/admin";

export const medicalRouter = router({
    // Vitals
    getVitals: protectedProcedure
        .input(z.object({ limit: z.number().default(10) }))
        .query(async ({ ctx, input }) => {
            if ((ctx as any).isDemoMode) {
                return [
                    { id: "1", type: "Blood Pressure", value: "120/80", unit: "mmHg", recordedAt: new Date() },
                    { id: "2", type: "Heart Rate", value: "72", unit: "bpm", recordedAt: new Date() },
                    { id: "3", type: "Temperature", value: "98.6", unit: "°F", recordedAt: new Date() },
                    { id: "4", type: "Blood Sugar", value: "95", unit: "mg/dL", recordedAt: new Date() },
                ];
            }
            try {
                return await ctx.db.query.healthVitals.findMany({
                    where: eq(healthVitals.userId, ctx.user.id),
                    limit: input.limit,
                    orderBy: [desc(healthVitals.recordedAt)],
                });
            } catch (error: any) {
                console.error("DEBUG_MEDICAL_ERROR: getVitals failed", error.message);
                return [];
            }
        }),


    logVitals: protectedProcedure
        .input(z.object({
            type: z.string(),
            value: z.string(),
            unit: z.string(),
            readingContext: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                return await ctx.db.insert(healthVitals).values({
                    userId: ctx.user.id,
                    ...input,
                }).returning();
            } catch (error: any) {
                console.error("DEBUG_MEDICAL_ERROR: logVitals failed", error.message);
                throw error;
            }
        }),


    // Appointments
    listAppointments: protectedProcedure.query(async ({ ctx }) => {
        if ((ctx as any).isDemoMode) {
            return [
                { 
                    id: "1", 
                    patientId: "patient-1", 
                    doctorId: "dummy-user-id", 
                    status: "confirmed", 
                    scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
                    type: "Checkup"
                },
                { 
                    id: "2", 
                    patientId: "patient-2", 
                    doctorId: "dummy-user-id", 
                    status: "pending", 
                    scheduledAt: new Date(Date.now() + 172800000), // Day after
                    type: "Consultation"
                }
            ];
        }
        try {
            // If doctor, show their appointments. If patient, show theirs.
            const profile = await ctx.db.query.profiles.findFirst({
                where: eq(profiles.userId, ctx.user.id),
            });

            if (profile?.role === 'doctor') {
                return await ctx.db.query.appointments.findMany({
                    where: eq(appointments.doctorId, ctx.user.id),
                    orderBy: [desc(appointments.scheduledAt)],
                });
            }

            return await ctx.db.query.appointments.findMany({
                where: eq(appointments.patientId, ctx.user.id),
                orderBy: [desc(appointments.scheduledAt)],
            });
        } catch (error: any) {
            console.error("DEBUG_MEDICAL_ERROR: listAppointments failed", error.message);
            return [];
        }
    }),

    // Records & Folders
    listFolders: protectedProcedure.query(async ({ ctx }) => {
        try {
            const admin = createAdminClient();
            const { data, error } = await admin
                .from('folders')
                .select('*')
                .eq('user_id', ctx.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Map to match the expected frontend structure (camelCase)
            return (data || []).map(f => ({
                id: f.id,
                userId: f.user_id,
                name: f.name,
                folderType: f.folder_type,
                createdAt: f.created_at
            }));
        } catch (error: any) {
            console.error("DEBUG_MEDICAL_ERROR: listFolders failed", error.message);
            return [];
        }
    }),

    createFolder: protectedProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ ctx, input }) => {
            try {
                return await ctx.db.insert(folders).values({
                    id: crypto.randomUUID(),
                    userId: ctx.user.id,
                    name: input.name,
                }).returning();
            } catch (error: any) {
                console.error("DEBUG_MEDICAL_ERROR: createFolder failed", error.message);
                throw error;
            }
        }),

    listRecords: protectedProcedure
        .input(z.object({ folderId: z.string().optional() }))
        .query(async ({ ctx, input }) => {
            try {
                const admin = createAdminClient();

                // Fetch prescriptions
                let prescriptionsQuery = admin
                    .from('prescriptions')
                    .select('*')
                    .eq('user_id', ctx.user.id)
                    .order('created_at', { ascending: false });

                if (input.folderId) {
                    prescriptionsQuery = prescriptionsQuery.eq('folder_id', input.folderId);
                }

                // Fetch lab reports
                let labReportsQuery = admin
                    .from('lab_reports')
                    .select('*')
                    .eq('user_id', ctx.user.id)
                    .order('created_at', { ascending: false });

                if (input.folderId) {
                    labReportsQuery = labReportsQuery.eq('folder_id', input.folderId);
                }

                const [{ data: prescriptionRows }, { data: labReportRows }] = await Promise.all([
                    prescriptionsQuery,
                    labReportsQuery,
                ]);

                // Map snake_case DB columns → camelCase for frontend
                const mappedPrescriptions = (prescriptionRows || []).map((r: any) => ({
                    id: r.id,
                    type: 'prescription' as const,
                    userId: r.user_id,
                    folderId: r.folder_id,
                    fileUrl: r.file_url,
                    clinicName: r.clinic_name,
                    doctorName: r.doctor_name,
                    prescriptionDate: r.prescription_date,
                    diagnosis: r.diagnosis,
                    summary: r.summary,
                    medicines: r.medicines || [],
                    specialization: r.specialization,
                    aiConfidence: r.ai_confidence,
                    createdAt: r.created_at,
                }));

                const mappedLabReports = (labReportRows || []).map((r: any) => ({
                    id: r.id,
                    type: 'lab_report' as const,
                    userId: r.user_id,
                    folderId: r.folder_id,
                    fileUrl: r.file_url,
                    labName: r.lab_name,
                    doctorName: r.doctor_name,
                    reportDate: r.report_date,
                    testName: r.test_name,
                    resultSummary: r.result_summary,
                    biomarkers: r.biomarkers || [],
                    isCritical: r.is_critical,
                    aiConfidence: r.ai_confidence,
                    createdAt: r.created_at,
                }));

                const combined = [
                    ...mappedPrescriptions,
                    ...mappedLabReports,
                ].sort((a, b) => {
                    const dateA = new Date((a as any).prescriptionDate || (a as any).reportDate || (a as any).createdAt || 0);
                    const dateB = new Date((b as any).prescriptionDate || (b as any).reportDate || (b as any).createdAt || 0);
                    return dateB.getTime() - dateA.getTime();
                });

                return { combined };
            } catch (error: any) {
                console.error("DEBUG_MEDICAL_ERROR: listRecords failed", error.message);
                return { combined: [] };
            }
        }),


    // Doctor specific
    listPatients: protectedProcedure.query(async ({ ctx }) => {
        if ((ctx as any).isDemoMode) {
            return [
                { userId: "patient-1", fullName: "John Doe", role: "patient" },
                { userId: "patient-2", fullName: "Jane Smith", role: "patient" },
                { userId: "patient-3", fullName: "Robert Brown", role: "patient" },
            ];
        }
        try {
            // This would normally involve an access_requests check or a relations table
            if (ctx.user.role !== "doctor") return [];
            
            const apps = await ctx.db.query.appointments.findMany({
                where: eq(appointments.doctorId, ctx.user.id),
            });
            
            const patientIds = [...new Set(apps.map(a => a.patientId))];
            
            if (patientIds.length === 0) return [];

            return ctx.db.query.profiles.findMany({
                where: (profiles, { inArray }) => inArray(profiles.userId, patientIds),
            });
        } catch (error: any) {
            console.error("DEBUG_MEDICAL_ERROR: listPatients failed", error.message);
            return [];
        }
    }),

    createPrescription: protectedProcedure
        .input(z.object({
            patientId: z.string(),
            diagnosis: z.string(),
            notes: z.string().optional(),
            medications: z.array(z.object({
                name: z.string(),
                dosage: z.string(),
                frequency: z.string(),
                duration: z.string(),
                instructions: z.string().optional(),
            })),
            followUpDate: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.user.role !== "doctor") {
                throw new Error("Only doctors can issue prescriptions");
            }

            return ctx.db.insert(prescriptions).values({
                doctorId: ctx.user.id,
                patientId: input.patientId,
                diagnosis: input.diagnosis,
                clinicalNotes: input.notes,
                medications: input.medications,
                status: "active",
                issuedAt: new Date(),
            }).returning();
        }),

    getPatientProfile: protectedProcedure
        .input(z.object({ patientId: z.string() }))
        .query(async ({ ctx, input }) => {
            // Permission check: doctor must have an appointment or access
            // For now, let doctors see any patient profile for simplicity in demo
            if (ctx.user.role !== 'doctor' && ctx.user.id !== input.patientId) {
                throw new Error("Unauthorized");
            }

            return await ctx.db.query.profiles.findFirst({
                where: eq(profiles.userId, input.patientId),
            });
        }),

    getPatientHistory: protectedProcedure
        .input(z.object({ patientId: z.string() }))
        .query(async ({ ctx, input }) => {
            if (ctx.user.role !== 'doctor' && ctx.user.id !== input.patientId) {
                throw new Error("Unauthorized");
            }

            const [reports, docs] = await Promise.all([
                ctx.db.query.labReports.findMany({
                    where: eq(labReports.userId, input.patientId),
                    orderBy: [desc(labReports.reportDate)],
                }),
                ctx.db.query.prescriptions.findMany({
                    where: eq(prescriptions.userId, input.patientId),
                    orderBy: [desc(prescriptions.prescriptionDate)],
                })
            ]);

            return {
                reports,
                prescriptions: docs,
                combined: [
                    ...reports.map(r => ({ ...r, type: 'lab_report' as const })),
                    ...docs.map(p => ({ ...p, type: 'prescription' as const }))
                ].sort((a, b) => {
                    const dateA = new Date((a as any).reportDate || (a as any).prescriptionDate || 0);
                    const dateB = new Date((b as any).reportDate || (b as any).prescriptionDate || 0);
                    return dateB.getTime() - dateA.getTime();
                })
            };
        }),

    processMedicalRecord: protectedProcedure
        .input(z.object({
            fileUrl: z.string(),
            folderId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {            try {
                // 0. Robust Identity Sync (Admin Client Bypasses RLS)
                const admin = createAdminClient();
                await admin.from('users').upsert({
                    id: ctx.user.id,
                    email: ctx.user.email!,
                    name: ctx.user.name || 'Patient',
                    role: 'patient'
                });

                // 1. Analyze with AI
                const analysis = await analyzeMedicalImage(input.fileUrl);

                const parseDate = (dateStr: string | undefined) => {
                    const now = new Date();
                    if (!dateStr) return now.toISOString().split('T')[0];
                    const d = new Date(dateStr);
                    const validDate = isNaN(d.getTime()) ? now : d;
                    return validDate.toISOString().split('T')[0];
                };

                // 2. Automatic Folder Logic
                let finalFolderId = input.folderId || null;
                const detectedName = analysis.type === 'prescription' ? analysis.details.clinicName : analysis.details.labName;
                const orgName = (detectedName || "My Medical Vault").trim();

                if (!finalFolderId) {
                    console.log(`[AUTO_FOLDER] 🚀 SYNCING VAULT: ${orgName}`);
                    
                    // Case-insensitive check
                    const { data: existing } = await admin
                        .from('folders')
                        .select('id')
                        .eq('user_id', ctx.user.id)
                        .ilike('name', orgName);

                    if (existing && existing.length > 0) {
                        finalFolderId = existing[0].id;
                        console.log(`[AUTO_FOLDER] Found: ${finalFolderId}`);
                    } else {
                        const newFolderId = crypto.randomUUID();
                        console.log(`[AUTO_FOLDER] Creating NEW: ${orgName}`);
                        
                        const { data: newFolder, error: folderErr } = await admin.from('folders').insert({
                            id: newFolderId,
                            user_id: ctx.user.id,
                            name: orgName,
                            folder_type: analysis.type
                        }).select().single();

                        if (folderErr) throw new Error(`Folder creation failed: ${folderErr.message}`);
                        finalFolderId = newFolderId;
                    }
                }

                // 3. Save Record
                console.log(`[PROCESS_RECORD] Saving ${analysis.type} to folder ${finalFolderId}`);
                
                if (analysis.type === 'prescription') {
                    const { data: record, error: insErr } = await admin.from('prescriptions').insert({
                        id: crypto.randomUUID(),
                        user_id: ctx.user.id,
                        folder_id: finalFolderId,
                        file_url: input.fileUrl,
                        clinic_name: analysis.details.clinicName || null,
                        doctor_name: analysis.details.doctorName || null,
                        prescription_date: parseDate(analysis.details.date),
                        diagnosis: analysis.details.diagnosis || null,
                        summary: analysis.summary,
                        medicines: analysis.details.medicines || [],
                        ai_processed: true,
                        ai_confidence: analysis.confidence
                    }).select().single();

                    if (insErr) throw new Error(`Prescription save failed: ${insErr.message}`);
                    return { type: 'prescription', record };
                } else {
                    const { data: record, error: insErr } = await admin.from('lab_reports').insert({
                        id: crypto.randomUUID(),
                        user_id: ctx.user.id,
                        folder_id: finalFolderId,
                        file_url: input.fileUrl,
                        lab_name: analysis.details.labName || null,
                        test_name: analysis.details.testName || null,
                        report_date: parseDate(analysis.details.date),
                        result_summary: analysis.summary,
                        biomarkers: analysis.details.biomarkers || [],
                        is_critical: analysis.details.isCritical || false
                    }).select().single();

                    if (insErr) throw new Error(`Lab report save failed: ${insErr.message}`);
                    return { type: 'lab_report', record };
                }
            } catch (error: any) {
                console.error("PROCESS_RECORD_ERROR_FULL:", error);
                throw new Error(`Analysis Failed: ${error.message}`);
            }
        }),

    chat: protectedProcedure
        .input(z.object({
            messages: z.array(z.object({
                role: z.enum(['user', 'assistant']),
                content: z.string(),
            })),
        }))
        .mutation(async ({ input }) => {
            try {
                const model = (await import("@google/generative-ai")).GoogleGenerativeAI;
                const genAI = new model(process.env.GEMINI_API_KEY || "");
                const generativeModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
                
                const chat = generativeModel.startChat({
                    history: input.messages.slice(0, -1).map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }],
                    })),
                });

                const lastMessage = input.messages[input.messages.length - 1].content;
                const result = await chat.sendMessage(lastMessage);
                const response = await result.response;
                
                return {
                    message: {
                        role: 'assistant',
                        content: response.text(),
                    }
                };
            } catch (error: any) {
                console.error("CHAT_ERROR:", error.message);
                throw new Error("I'm having trouble thinking right now. Please try again.");
            }
        }),

    getUploadUrl: protectedProcedure
        .input(z.object({ fileName: z.string() }))
        .mutation(async ({ input }) => {
            try {
                const admin = createAdminClient();
                const { data, error } = await admin.storage
                    .from('medical-records')
                    .createSignedUploadUrl(input.fileName);

                if (error) throw error;
                return data;
            } catch (error: any) {
                console.error("GET_UPLOAD_URL_ERROR:", error.message);
                throw new Error(`Failed to get upload URL: ${error.message}`);
            }
        }),
});

