"use client";

import { useState } from "react";
import {
    Plus, FolderIcon, FileText, Search, MoreVertical,
    Download, Trash2, ExternalLink, Filter, Grid, List as ListIcon,
    FolderPlus, Upload, Shield, Sparkles, Loader2, ArrowRight
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function MedicalRecordsPage() {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState("");

    // Placeholders for now - these will be TRPC queries
    const { data: records, isLoading } = trpc.medical.listRecords.useQuery({});
    const { data: folders } = trpc.medical.listFolders.useQuery();


    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-[#05050a]" />
                    <p className="text-[12px] font-bold text-[#b0b0b0] uppercase tracking-widest">Accessing Vault...</p>
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
                        Records
                    </h1>
                    <p className="text-[15px] font-medium text-[#8a8a8a] max-w-sm">Securely store and organize your medical history with AI-powered insights.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-5 py-3.5 text-[14px] font-black text-[#05050a] transition-all hover:premium-shadow active:scale-95"
                    >
                        <FolderPlus className="h-5 w-5" />
                        NEW FOLDER
                    </button>
                    <button
                        className="flex items-center gap-2 rounded-xl bg-[#05050a] px-6 py-3.5 text-[14px] font-black text-[#b8ff00] shadow-xl shadow-black/10 transition-all hover:scale-[1.05] active:scale-95"
                    >
                        <Upload className="h-5 w-5" strokeWidth={3} />
                        UPLOAD RECORD
                    </button>
                </div>
            </div>

            {/* toolbar */}
            <div className="flex items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-black/5">
                <div className="flex items-center gap-2 flex-1 max-w-md px-4">
                    <Search className="h-4 w-4 text-[#b0b0b0]" />
                    <input
                        type="text"
                        placeholder="Search prescriptions, reports, doctors..."
                        className="bg-transparent border-none focus:outline-none text-sm font-medium w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-[1px] bg-black/5 mx-2" />
                    <button
                        onClick={() => setView('grid')}
                        className={cn("p-2 rounded-lg transition-all", view === 'grid' ? "bg-white shadow-sm text-[#05050a]" : "text-[#b0b0b0] hover:text-[#05050a]")}
                    >
                        <Grid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={cn("p-2 rounded-lg transition-all", view === 'list' ? "bg-white shadow-sm text-[#05050a]" : "text-[#b0b0b0] hover:text-[#05050a]")}
                    >
                        <ListIcon className="h-4 w-4" />
                    </button>
                    <div className="h-8 w-[1px] bg-black/5 mx-2" />
                    <button className="flex items-center gap-2 px-4 h-9 text-[12px] font-bold text-[#8a8a8a] hover:text-[#05050a]">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Folders Section */}
            <div className="space-y-6">
                <h3 className="text-[20px] font-black tracking-tight text-[#05050a] px-2" style={{ fontFamily: "var(--font-display)" }}>Folders</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {['Prescriptions', 'Lab Reports', 'Scans', 'Billing', 'Emergency'].map((folder) => (
                        <button
                            key={folder}
                            className="group flex flex-col p-6 premium-card rounded-[28px] hover:border-[#b8ff00] transition-all text-left relative overflow-hidden"
                        >
                            <FolderIcon className="h-10 w-10 text-[#05050a] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[14px] font-black text-[#05050a]">{folder}</span>
                            <span className="text-[11px] font-medium text-[#b0b0b0]">12 items</span>
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-4 w-4 text-[#b8ff00]" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Files */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>Recent Medical Records</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="group premium-card rounded-[32px] overflow-hidden relative border-t-4 border-t-[#b8ff00]">
                            <div className="p-8 flex flex-col gap-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] group-hover:rotate-6 transition-transform">
                                            <FileText className="h-7 w-7" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-[16px] font-black text-[#05050a] leading-tight">Prescription - Apollo</h4>
                                            <p className="text-[11px] font-bold text-[#b0b0b0] uppercase tracking-widest">DR. SARAH CONNOR</p>
                                        </div>
                                    </div>
                                    <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-black/5 text-[#b0b0b0] hover:text-[#05050a]">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="p-5 rounded-2xl bg-[#fafaf8] border border-black/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0]">AI Extraction</span>
                                        <Badge className="bg-[#b8ff00]/20 text-[#05050a] text-[9px] font-black border-none rounded-md">88% CONFIDENCE</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-[#b8ff00]" />
                                            <span className="text-[12px] font-bold text-[#05050a]">Diagnosis: Hypertension</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-[#b8ff00]" />
                                            <span className="text-[12px] font-bold text-[#05050a]">3 Medications detected</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[11px] font-bold text-[#b0b0b0]">Oct 12, 2023</span>
                                    <div className="flex gap-2">
                                        <button className="h-9 w-9 rounded-xl border border-black/5 flex items-center justify-center hover:bg-[#05050a] hover:text-white transition-all">
                                            <Download className="h-4 w-4" />
                                        </button>
                                        <button className="flex items-center gap-2 px-4 h-9 bg-[#05050a] text-white rounded-xl text-[12px] font-black hover:scale-105 transition-all">
                                            VIEW <ExternalLink className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Banner */}
            <div className="bg-gradient-to-r from-[#05050a] to-[#1a1a2e] rounded-[32px] p-10 text-white relative overflow-hidden group">
                <Shield className="absolute right-10 top-1/2 -translate-y-1/2 h-40 w-40 text-white/5 rotate-12 transition-transform group-hover:scale-110" />
                <div className="relative z-10 max-w-xl space-y-4">
                    <div className="flex items-center gap-2 text-[#b8ff00]">
                        <Sparkles className="h-5 w-5" />
                        <span className="text-[12px] font-black uppercase tracking-[0.2em]">Military Grade Security</span>
                    </div>
                    <h2 className="text-[28px] font-black tracking-tight leading-tight">Your data is encrypted and only accessible by you and authorized doctors.</h2>
                    <p className="text-[#8a8a8a] text-[15px] font-medium italic">"Privacy is not an option, it's a foundation."</p>
                </div>
            </div>
        </div>
    );
}
