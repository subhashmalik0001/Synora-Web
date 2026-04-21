"use client";

import { use } from "react";
import { 
    ChevronLeft, FileText, Calendar, Activity, 
    MessageSquare, Pill, AlertCircle, ExternalLink,
    Search, Filter, Plus, User, Sparkles
} from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PatientDetailPage({ params }: { params: { id: string } }) {
    const patientId = params.id;
    const { data: profile, isLoading: profileLoading } = trpc.medical.getPatientProfile.useQuery({ patientId });
    const { data: history, isLoading: historyLoading } = trpc.medical.getPatientHistory.useQuery({ patientId });

    if (profileLoading || historyLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-[#05050a]" />
            </div>
        );
    }

    if (!profile) return <div>Patient not found</div>;

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href="/doctor/patients">
                        <button className="h-14 w-14 rounded-2xl border border-black/5 flex items-center justify-center hover:bg-black/5 transition-all">
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-[32px] font-black tracking-tight text-[#05050a]">
                                {profile.fullName}
                            </h1>
                            <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[10px] font-black uppercase">Active</Badge>
                        </div>
                        <p className="text-[14px] font-medium text-[#8a8a8a]">
                            Patient ID: {patientId.slice(0, 8).toUpperCase()} • {profile.role}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-black/5 rounded-xl text-[14px] font-black text-[#05050a] shadow-sm hover:premium-shadow transition-all">
                        <MessageSquare className="h-5 w-5" /> CHAT
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3.5 bg-[#05050a] text-[#b8ff00] rounded-xl text-[14px] font-black shadow-xl hover:scale-105 transition-all">
                        <Plus className="h-5 w-5" /> NEW PRESCRIPTION
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Col: Info & Vitals */}
                <div className="space-y-8">
                    <div className="premium-card rounded-[32px] p-8 space-y-6">
                        <h3 className="text-[18px] font-black text-[#05050a] tracking-tight">Clinical Overview</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.02] border border-black/5">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-red-500" />
                                    <span className="text-[13px] font-bold text-[#8a8a8a]">Blood Pressure</span>
                                </div>
                                <span className="text-[15px] font-black text-[#05050a]">120/80</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.02] border border-black/5">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                    <span className="text-[13px] font-bold text-[#8a8a8a]">Heart Rate</span>
                                </div>
                                <span className="text-[15px] font-black text-[#05050a]">72 BPM</span>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card rounded-[32px] p-8 space-y-6 border-l-4 border-l-[#b8ff00]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[18px] font-black text-[#05050a] tracking-tight">AI Health Summary</h3>
                            <Sparkles className="h-5 w-5 text-[#b8ff00]" />
                        </div>
                        <p className="text-[14px] font-medium text-[#8a8a8a] leading-relaxed">
                            Patient shows stable cardiovascular markers. Recent lab results indicate slight vitamin D deficiency. All other biomarkers are within the reference range.
                        </p>
                    </div>
                </div>

                {/* Right Col: History */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[22px] font-black text-[#05050a] tracking-tight">Medical History</h3>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b0b0b0]" />
                                <input 
                                    type="text" 
                                    placeholder="Search history..." 
                                    className="h-10 pl-10 pr-4 bg-white border border-black/5 rounded-xl text-[12px] font-medium w-48 focus:w-64 transition-all outline-none"
                                />
                            </div>
                            <button className="h-10 w-10 border border-black/5 rounded-xl flex items-center justify-center text-[#8a8a8a]">
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {history?.combined.map((item, idx) => (
                            <div key={idx} className="group premium-card rounded-[28px] overflow-hidden hover:border-[#b8ff00] transition-all">
                                <div className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6",
                                            item.type === 'prescription' ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"
                                        )}>
                                            {item.type === 'prescription' ? <Pill className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
                                        </div>
                                        <div>
                                            <h4 className="text-[16px] font-black text-[#05050a] tracking-tight">
                                                {item.type === 'prescription' ? (item as any).clinicName : (item as any).testName}
                                            </h4>
                                            <div className="flex items-center gap-3 text-[12px] font-medium text-[#b0b0b0]">
                                                <span className="uppercase font-black text-[10px] tracking-widest">{item.type.replace('_', ' ')}</span>
                                                <span className="h-1 w-1 rounded-full bg-[#d0d0d0]" />
                                                <span>{new Date((item as any).reportDate || (item as any).prescriptionDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <a 
                                            href={(item as any).fileUrl} 
                                            target="_blank" 
                                            className="h-11 w-11 rounded-xl border border-black/5 flex items-center justify-center hover:bg-[#05050a] hover:text-white transition-all"
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                        <button className="px-5 h-11 bg-black/[0.03] text-[#05050a] rounded-xl text-[12px] font-black hover:bg-black/[0.06] transition-all">
                                            REVIEW
                                        </button>
                                    </div>
                                </div>
                                <div className="px-6 pb-6 pt-0">
                                    <div className="p-4 rounded-2xl bg-black/[0.01] border border-black/5">
                                        <p className="text-[13px] font-medium text-[#8a8a8a] line-clamp-2 italic">
                                            "{(item as any).resultSummary || (item as any).summary || "No AI summary available."}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!history?.combined || history.combined.length === 0) && (
                            <div className="py-20 text-center space-y-4">
                                <div className="h-16 w-16 bg-black/5 rounded-2xl flex items-center justify-center mx-auto">
                                    <AlertCircle className="h-8 w-8 text-[#d0d0d0]" />
                                </div>
                                <p className="text-[14px] font-bold text-[#b0b0b0]">No medical history recorded for this patient.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
