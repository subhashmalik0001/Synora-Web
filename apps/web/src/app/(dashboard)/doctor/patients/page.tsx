"use client";

import { useState } from "react";
import {
    Search, UserPlus, MoreHorizontal, ArrowUpDown,
    Download, MailQuestion, MessageSquare, ChevronRight,
    Loader2, CheckCircle2, Star, Shield, Filter
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function DoctorPatientsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: members, isLoading } = trpc.medical.listPatients.useQuery();


    const filteredPatients = (members || []).filter((patient: any) => {
        // Mock filtering logic
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-[#05050a]" />
                    <p className="text-[12px] font-bold text-[#b0b0b0] uppercase tracking-widest">Hydrating Patient Registry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-[1400px] mx-auto pb-20">
            {/* Contextual Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
                        Ecosystem
                    </h1>
                    <p className="text-[15px] font-medium text-[#8a8a8a] max-w-sm">Manage Every patient in your clinical practice and review their health history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-black/5 bg-white text-[#05050a] transition-all hover:premium-shadow active:scale-95">
                        <Download className="h-5 w-5" />
                    </button>
                    <button
                        className="flex items-center gap-2 rounded-xl bg-[#05050a] px-6 py-3.5 text-[14px] font-black text-[#b8ff00] shadow-xl shadow-black/10 transition-all hover:scale-[1.05] active:scale-95"
                    >
                        <UserPlus className="h-5 w-5" strokeWidth={3} />
                        ADD PATIENT
                    </button>
                </div>
            </div>

            {/* Utility Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-black/5 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b0b0b0] group-focus-within:text-[#05050a] transition-colors" />
                    <input
                        type="search"
                        placeholder="Search by name, patient ID, or diagnosis..."
                        className="w-full h-12 rounded-xl border-none bg-transparent pl-11 pr-4 text-[13px] font-bold text-[#05050a] focus:ring-0 placeholder:text-[#d0d0d0]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="h-8 w-px bg-black/5 hidden lg:block" />
                <div className="flex items-center gap-2 px-2">
                    {['all', 'active', 'critical', 'pending'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all",
                                statusFilter === s ? "bg-[#05050a] text-white" : "text-[#b0b0b0] hover:text-[#05050a] hover:bg-black/5"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black text-[#05050a] hover:bg-black/5">
                    <Filter className="h-3.5 w-3.5" /> FILTER
                </button>
            </div>

            {/* Patient List */}
            <div className="premium-card rounded-[32px] overflow-hidden">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-black/[0.04]">
                            <thead>
                                <tr className="bg-black/[0.01]">
                                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Patient</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Vital Health</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Flags</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.04]">
                                {[1, 2, 3].map((i) => (
                                    <tr key={i} className="group transition-all hover:bg-black/[0.01]">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] font-black text-[12px] shadow-lg shadow-black/5 transition-transform group-hover:scale-110">
                                                    P{i}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[15px] font-black text-[#05050a] truncate tracking-tight">Patient #{i + 240}</span>
                                                    <div className="flex items-center gap-2 text-[12px] font-medium text-[#8a8a8a]">
                                                        <span>M, 34yr</span>
                                                        <span className="h-1 w-1 rounded-full bg-[#d0d0d0]" />
                                                        <span>Ref: #ID-4423</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-bold text-[#05050a]">120/80 mmHg</span>
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[9px] font-black px-1.5 py-0.5">HYPER-STABLE</Badge>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#d0d0d0]">
                                                    <CheckCircle2 className="h-3 w-3 text-[#b8ff00]" />
                                                    <span>Last pulse: 72 BPM</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                 <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg px-2 py-1 text-[10px] uppercase font-black">Record OK</Badge>
                                                 {i === 2 && <Badge className="bg-red-50 text-red-600 border border-red-100 rounded-lg px-2 py-1 text-[10px] uppercase font-black transition-all animate-pulse">Critical Lab</Badge>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="flex items-center gap-2 px-4 h-10 bg-[#05050a] text-white rounded-xl text-[12px] font-black hover:scale-105 transition-all">
                                                    PROFILE <ChevronRight className="h-4 w-4" />
                                                </button>
                                                <button className="p-2.5 rounded-xl text-[#d0d0d0] hover:text-[#05050a] hover:bg-black/5 transition-all">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table >
                    </div >
                </div >
            </div >

            {filteredPatients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="h-24 w-24 rounded-[32px] bg-black/5 flex items-center justify-center group">
                        <MailQuestion className="h-10 w-10 text-[#d0d0d0] group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-[20px] font-black text-[#05050a]">No patients match your search.</h3>
                        <p className="text-[14px] font-medium text-[#8a8a8a] max-w-sm">Try broadening your search or registering a new patient.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
