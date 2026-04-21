"use client";

import { useState } from "react";
import {
    Activity, Clock, FileText, Heart, Loader2, 
    MessageSquare, Pill, Plus, Save, Send, 
    Shield, Sparkles, User, Video, Zap, PlusCircle,
    Thermometer, Droplets, ArrowLeft, History
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function OPDSessionPage() {
    const [notes, setNotes] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [medProgress, setMedProgress] = useState("");
    const [medications, setMedications] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const utils = trpc.useUtils();
    const savePrescription = trpc.medical.createPrescription.useMutation({
        onSuccess: () => {
            setIsSaving(false);
            alert("Prescription Finalized & Saved!");
            utils.medical.listRecords.invalidate();
        },
        onError: (err) => {
            setIsSaving(false);
            alert("Error saving prescription: " + err.message);
        }
    });

    const handleAddMed = () => {
        if (!medProgress) return;
        setMedications([...medications, { 
            name: medProgress.split("-")[0].trim(),
            dosage: "500mg", // parsing logic could be better
            frequency: medProgress.split("-")[1]?.trim() || "1-0-1",
            duration: "5 days",
            instructions: "After food"
        }]);
        setMedProgress("");
    };

    const handleFinalize = () => {
        setIsSaving(true);
        savePrescription.mutate({
            patientId: "patient_123", // In a real app, this comes from the current session
            diagnosis: diagnosis || "General Consultation",
            notes: notes,
            medications: medications,
        });
    };

    // Mock data for the current active patient in the session
    const patient = {
        name: "Arthur Dent",
        age: 42,
        gender: "Male",
        bloodGroup: "O+",
        vitals: {
            bp: "118/79",
            hr: "72",
            temp: "98.4",
            spo2: "99"
        }
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
            {/* Header: Live Session Status */}
            <div className="flex items-center justify-between bg-[#05050a] text-white p-6 rounded-[32px] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[#b8ff00] opacity-5 blur-[100px] -right-20" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-[#b8ff00] flex items-center justify-center text-[#05050a] animate-pulse">
                        <Video className="h-8 w-8" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-[24px] font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Live Consultation</h1>
                            <Badge className="bg-[#b8ff00] text-[#05050a] border-none rounded-lg text-[10px] font-black animate-pulse">REC: ACTIVE</Badge>
                        </div>
                        <p className="text-[#8a8a8a] text-[13px] font-medium mt-1">Session ID: #OPD-22419 • Duration: 12:45</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <button className="px-6 py-3 bg-red-500 text-white rounded-xl text-[13px] font-black hover:bg-red-600 transition-all active:scale-95">
                        END SESSION
                    </button>
                    <button className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                        <Shield className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Patient History & Vitals (Column 4) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Patient Context Card */}
                    <div className="premium-card rounded-[32px] p-8 space-y-6 shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center text-[#b8ff00] text-[18px] font-black">
                                {patient.name[0]}
                            </div>
                            <div>
                                <h3 className="text-[20px] font-black text-[#05050a] tracking-tight">{patient.name}</h3>
                                <p className="text-[12px] font-bold text-[#b0b0b0] uppercase tracking-widest">{patient.age}Y • {patient.gender} • {patient.bloodGroup}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4">
                            {[
                                { icon: Heart, label: 'B.P.', value: patient.vitals.bp, unit: 'mmHg', color: 'text-red-500' },
                                { icon: Activity, label: 'Pulse', value: patient.vitals.hr, unit: 'BPM', color: 'text-[#b8ff00]' },
                                { icon: Thermometer, label: 'Temp', value: patient.vitals.temp, unit: '°F', color: 'text-orange-500' },
                                { icon: Droplets, label: 'SpO2', value: patient.vitals.spo2, unit: '%', color: 'text-blue-500' },
                            ].map((v, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-[#fafaf8] border border-black/5 flex flex-col gap-1 justify-center">
                                    <div className="flex items-center gap-2">
                                        <v.icon className={cn("h-3.5 w-3.5", v.color)} />
                                        <span className="text-[9px] font-black text-[#b0b0b0] uppercase tracking-widest">{v.label}</span>
                                    </div>
                                    <span className="text-[16px] font-black text-[#05050a]">{v.value} <span className="text-[10px] text-[#8a8a8a]">{v.unit}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI History Summary */}
                    <div className="bg-[#b8ff00]/10 border border-[#b8ff00]/30 rounded-[32px] p-8 space-y-4">
                         <div className="flex items-center gap-2">
                             <Sparkles className="h-5 w-5 text-[#05050a]" />
                             <h4 className="text-[14px] font-black text-[#05050a] uppercase tracking-widest">Neural History Summary</h4>
                         </div>
                         <p className="text-[13px] font-medium text-[#05050a]/70 italic leading-relaxed">
                             "Patient has recurring migraines. Last lab report showed slight Vitamin D deficiency. No drug allergies reported."
                         </p>
                         <button className="flex items-center gap-2 text-[11px] font-black text-[#05050a] uppercase border-b border-[#05050a]/20 pb-1 hover:gap-3 transition-all">
                             View Full Records <History className="h-3 w-3" />
                         </button>
                    </div>

                    {/* Quick Records list */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                             <h4 className="text-[16px] font-black text-[#05050a] tracking-tight">Recent Scans</h4>
                             <PlusCircle className="h-4 w-4 text-[#b0b0b0] hover:text-[#05050a] cursor-pointer" />
                        </div>
                        {[1, 2].map(i => (
                            <div key={i} className="premium-card rounded-2xl p-4 flex items-center gap-4 transition-all hover:premium-shadow cursor-pointer">
                                <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center text-[#05050a]">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[13px] font-black text-[#05050a] truncate">MRI Brain - T1 Contrast</span>
                                    <span className="text-[10px] font-bold text-[#b0b0b0]">Oct {12 + i}, 2023</span>
                                </div>
                                <Zap className="ml-auto h-4 w-4 text-[#b8ff00]" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Consultation Workspace (Column 8) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Notes & Prescription Section */}
                    <div className="premium-card rounded-[32px] overflow-hidden flex flex-col h-full min-h-[600px]">
                        <div className="p-8 border-b border-black/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <FileText className="h-5 w-5 text-[#05050a]" />
                                <input 
                                    className="text-[20px] font-black text-[#05050a] tracking-tight bg-transparent border-none focus:ring-0 p-0 w-full" 
                                    placeholder="Diagnosis / Condition Name"
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-3 bg-black/5 text-[#05050a] rounded-xl hover:bg-black/10 transition-all">
                                    <Pill className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleFinalize}
                                    className="flex items-center gap-2 bg-[#05050a] text-[#b8ff00] px-6 py-3 rounded-xl text-[13px] font-black shadow-xl shadow-black/10 transition-all hover:scale-[1.03] active:scale-95"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    FINALIZE PRESCRIPTION
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-8 bg-[#fafaf8]/50 flex flex-col gap-6">
                            <div className="flex-1">
                                <textarea 
                                    className="w-full h-full bg-transparent border-none focus:ring-0 text-[16px] font-medium placeholder:text-[#d0d0d0] scrollbar-hide resize-none leading-relaxed"
                                    placeholder="Start typing clinical notes, and advice here..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {/* Added Medications List */}
                            {medications.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#b0b0b0]">Prescribed Medication</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {medications.map((med, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-2xl border border-black/5 flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-[#b8ff00]/10 flex items-center justify-center text-[#05050a]">
                                                    <Pill className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black">{med.name}</span>
                                                    <span className="text-[11px] font-medium text-[#8a8a8a]">{med.dosage} • {med.frequency}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Medication Add Bar */}
                        <div className="p-6 border-t border-black/[0.04] bg-white">
                             <div className="flex items-center gap-4 bg-[#fafaf8] p-4 rounded-2xl border border-black/5">
                                 <Plus className="h-5 w-5 text-[#b0b0b0]" />
                                 <input 
                                    className="bg-transparent border-none focus:ring-0 flex-1 text-[13px] font-bold"
                                    placeholder="Quick add medicine (e.g. Paracetamol - 1-0-1)"
                                    value={medProgress}
                                    onChange={(e) => setMedProgress(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddMed()}
                                 />
                                 <button 
                                    onClick={handleAddMed}
                                    className="h-9 w-9 bg-[#05050a] text-[#b8ff00] rounded-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
                                 >
                                    <Send className="h-4 w-4" />
                                 </button>
                             </div>
                        </div>
                    </div>


                    {/* Shared Context / Chat Sidebar (Optional/Small) */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="premium-card rounded-[28px] p-6 flex items-center gap-4 border-l-4 border-l-[#b8ff00]">
                            <div className="h-10 w-10 bg-black/5 flex items-center justify-center rounded-xl text-[#05050a]">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-black text-[#05050a]">Patient Message</span>
                                <span className="text-[11px] font-bold text-[#b0b0b0]">"Having severe back pain since morning"</span>
                            </div>
                        </div>
                         <div className="premium-card rounded-[28px] p-6 flex items-center gap-4 border-l-4 border-l-blue-500">
                            <div className="h-10 w-10 bg-blue-500/10 flex items-center justify-center rounded-xl text-blue-500">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-black text-[#05050a]">Remote Sensor Sync</span>
                                <span className="text-[11px] font-bold text-[#b0b0b0]">Apple Watch Heart Sync Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
