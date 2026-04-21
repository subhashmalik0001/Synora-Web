"use client";

import { useState } from "react";
import {
    Search, Calendar, MoreHorizontal, ArrowUpDown,
    Download, Clock, Video, MapPin, CheckCircle2,
    Loader2, Users, ChevronRight, Zap, Filter
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function DoctorAppointmentsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: appointments, isLoading } = trpc.subscription.listMembers.useQuery() as any; // Replace with listDoctorAppointments

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-[#05050a]" />
                    <p className="text-[12px] font-bold text-[#b0b0b0] uppercase tracking-widest">Hydrating Schedule...</p>
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
                        Schedule
                    </h1>
                    <p className="text-[15px] font-medium text-[#8a8a8a] max-w-sm">Manage your patient appointments, availability, and session bookings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-black/5 bg-white text-[#05050a] transition-all hover:premium-shadow active:scale-95">
                        <Download className="h-5 w-5" />
                    </button>
                    <button
                        className="flex items-center gap-2 rounded-xl bg-[#05050a] px-6 py-3.5 text-[14px] font-black text-[#b8ff00] shadow-xl shadow-black/10 transition-all hover:scale-[1.05] active:scale-95"
                    >
                        <Zap className="h-5 w-5" strokeWidth={3} />
                        GO LIVE (OPD)
                    </button>
                </div>
            </div>

            {/* Utility Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-black/5 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b0b0b0] group-focus-within:text-[#05050a] transition-colors" />
                    <input
                        type="search"
                        placeholder="Search by patient name, ID, or condition..."
                        className="w-full h-12 rounded-xl border-none bg-transparent pl-11 pr-4 text-[13px] font-bold text-[#05050a] focus:ring-0 placeholder:text-[#d0d0d0]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="h-8 w-px bg-black/5 hidden lg:block" />
                <div className="flex items-center gap-2 px-2">
                    {['all', 'confirmed', 'pending', 'completed'].map(s => (
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

            {/* Appointments table */}
            <div className="premium-card rounded-[32px] overflow-hidden">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-black/[0.04]">
                            <thead>
                                <tr className="bg-black/[0.01]">
                                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Patient</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Session Info</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Status</th>
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
                                                    <span className="text-[15px] font-black text-[#05050a] truncate tracking-tight">Patient #{i + 1440}</span>
                                                    <div className="flex items-center gap-2 text-[12px] font-medium text-[#8a8a8a]">
                                                        <span>Ref: #V-442{i}</span>
                                                        <span className="h-1 w-1 rounded-full bg-[#d0d0d0]" />
                                                        <span>Dr. House Retainer</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-[13px] font-bold text-[#05050a]">
                                                    <Clock className="h-4 w-4 text-[#b0b0b0]" />
                                                    <span>Today, 10:{i}5 AM</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                     <Badge className="bg-[#b8ff00]/20 text-[#05050a] border-none rounded-lg text-[9px] font-black px-1.5 py-0.5">
                                                        {i % 2 === 0 ? <Video className="h-3 w-3 mr-1 inline" /> : <MapPin className="h-3 w-3 mr-1 inline" />}
                                                        {i % 2 === 0 ? "VIRTUAL" : "OFFLINE"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge className={cn(
                                                "rounded-lg px-2.5 py-1 text-[10px] uppercase font-black tracking-widest border border-transparent shadow-sm",
                                                i === 1 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-600"
                                            )}>
                                                {i === 1 ? "Confirmed" : "Pending Sync"}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                 {i === 1 ? (
                                                     <button className="h-10 px-4 bg-[#05050a] text-[#b8ff00] rounded-xl text-[12px] font-black hover:scale-105 transition-all shadow-lg shadow-black/10">
                                                        START SESSION
                                                     </button>
                                                 ) : (
                                                     <button className="h-10 px-4 bg-white border border-black/5 text-[#05050a] rounded-xl text-[12px] font-black hover:premium-shadow transition-all">
                                                        DETAILS
                                                     </button>
                                                 )}
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
        </div>
    );
}
