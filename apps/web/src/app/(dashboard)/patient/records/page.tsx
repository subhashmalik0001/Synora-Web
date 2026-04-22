"use client";

import { useState } from "react";
import {
    Plus, FolderIcon, FileText, Search, MoreVertical,
    Download, ExternalLink, Filter, Grid, List as ListIcon,
    FolderPlus, Upload, Shield, Sparkles, Loader2, ArrowRight, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import Link from "next/link";

function ConfidenceBadge({ value }: { value?: number }) {
    if (!value) return null;
    const pct = Math.round(value * 100);
    const color = pct >= 85 ? "bg-green-100 text-green-700" : pct >= 70 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
    return <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${color}`}>{pct}% AI</span>;
}

export default function MedicalRecordsPage() {
    const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState("");
    const utils = trpc.useUtils();

    const { data: folders } = trpc.medical.listFolders.useQuery();
    const { data: records, isLoading } = trpc.medical.listRecords.useQuery({
        folderId: selectedFolderId || undefined
    });

    const selectedFolder = folders?.find(f => f.id === selectedFolderId);

    const createFolder = trpc.medical.createFolder.useMutation({
        onSuccess: () => utils.medical.listFolders.invalidate()
    });

    const handleCreateFolder = () => {
        const name = prompt("Enter folder name:");
        if (name?.trim()) createFolder.mutate({ name: name.trim() });
    };

    const deleteFolder = trpc.medical.deleteFolder.useMutation({
        onSuccess: () => {
            utils.medical.listFolders.invalidate();
            setSelectedFolderId(null);
        }
    });

    const deleteRecord = trpc.medical.deleteRecord.useMutation({
        onSuccess: () => {
            utils.medical.listRecords.invalidate();
            setSelectedRecord(null);
        }
    });

    const handleDeleteFolder = (e: React.MouseEvent, folderId: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this folder? All records inside will be kept but unassigned.")) {
            deleteFolder.mutate({ folderId });
        }
    };

    const handleDeleteRecord = () => {
        if (!selectedRecord) return;
        if (confirm("Are you sure you want to delete this record permanently?")) {
            deleteRecord.mutate({ recordId: selectedRecord.id, type: selectedRecord.type });
        }
    };

    // Filter by search query
    const filtered = records?.combined?.filter((r: any) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (r.doctorName || r.labName || r.clinicName || "").toLowerCase().includes(q) ||
            (r.diagnosis || r.testName || "").toLowerCase().includes(q)
        );
    }) || [];

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
        <div className="space-y-10 max-w-[1400px] mx-auto pb-20">

            {/* ── DETAIL MODAL ── */}
            {selectedRecord && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedRecord(null)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-black/5 overflow-hidden">
                        <div className="p-10 space-y-6 max-h-[82vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <Badge className="bg-[#b8ff00] text-[#05050a] font-black border-none uppercase tracking-widest">
                                        {selectedRecord.type === 'prescription' ? 'Full Prescription' : 'Lab Analysis'}
                                    </Badge>
                                    <h2 className="text-[28px] font-black tracking-tight text-[#05050a]">
                                        {selectedRecord.doctorName || selectedRecord.labName || 'Medical Document'}
                                    </h2>
                                    <p className="text-[#8a8a8a] font-medium text-sm">
                                        {selectedRecord.clinicName || selectedRecord.testName || ''} &nbsp;•&nbsp;
                                        {new Date(selectedRecord.prescriptionDate || selectedRecord.reportDate || selectedRecord.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedRecord(null)}
                                    className="h-11 w-11 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                                    <Plus className="h-5 w-5 rotate-45" />
                                </button>
                            </div>

                            {/* Low confidence warning */}
                            {selectedRecord.aiConfidence && selectedRecord.aiConfidence < 0.7 && (
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-amber-500 shrink-0" />
                                    <p className="text-[12px] font-bold text-amber-800 uppercase tracking-tight">
                                        Low confidence — Please verify extracted data with original document
                                    </p>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="p-6 rounded-3xl bg-[#fafaf8] border border-black/5">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#b0b0b0] mb-3">AI Summary</h4>
                                <p className="text-[#05050a] font-medium leading-relaxed text-sm">
                                    {selectedRecord.summary || selectedRecord.resultSummary || "Document successfully analyzed and categorized."}
                                </p>
                            </div>

                            {/* Medicines or Biomarkers */}
                            {selectedRecord.type === 'prescription' ? (
                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#b0b0b0] px-1">Medications</h4>
                                    {(selectedRecord.medicines?.length > 0) ? selectedRecord.medicines.map((med: any, i: number) => (
                                        <div key={i} className="p-5 rounded-2xl border border-black/5 flex items-center justify-between">
                                            <div>
                                                <p className="font-black text-[#05050a]">{med.name}</p>
                                                <p className="text-[11px] font-bold text-[#b0b0b0] uppercase tracking-widest mt-0.5">
                                                    {med.dosage} {med.dosage && med.frequency ? '•' : ''} {med.frequency}
                                                </p>
                                                {med.instructions && <p className="text-[11px] text-[#8a8a8a] mt-0.5">{med.instructions}</p>}
                                            </div>
                                            {med.duration && <Badge className="bg-black/5 text-[#05050a] border-none font-black shrink-0">{med.duration}</Badge>}
                                        </div>
                                    )) : (
                                        <p className="text-center py-4 text-[#b0b0b0] text-[11px] font-bold uppercase tracking-widest">No medications detected</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#b0b0b0] px-1">Biomarkers</h4>
                                    {(selectedRecord.biomarkers?.length > 0) ? selectedRecord.biomarkers.map((bio: any, i: number) => {
                                        const isOutOfRange = bio.value < bio.normal_min || bio.value > bio.normal_max;
                                        return (
                                            <div key={i} className={cn(
                                                "p-5 rounded-2xl border flex items-center justify-between",
                                                isOutOfRange ? "border-red-200 bg-red-50" : "border-black/5"
                                            )}>
                                                <div>
                                                    <p className="font-black text-[#05050a]">{bio.name}</p>
                                                    <p className="text-[11px] font-bold text-[#b0b0b0] uppercase tracking-widest mt-0.5">{bio.unit}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={cn("font-black text-lg", isOutOfRange ? "text-red-600" : "text-[#05050a]")}>{bio.value}</p>
                                                    <p className="text-[10px] font-bold text-[#b0b0b0]">Range: {bio.normal_min}–{bio.normal_max}</p>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-center py-4 text-[#b0b0b0] text-[11px] font-bold uppercase tracking-widest">No biomarkers detected</p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <a href={selectedRecord.fileUrl} download target="_blank" rel="noopener noreferrer" className="flex-1">
                                    <button className="w-full h-14 bg-[#05050a] text-[#b8ff00] rounded-2xl font-black text-[13px] transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                                        <Download className="h-5 w-5" /> DOWNLOAD ORIGINAL
                                    </button>
                                </a>
                                <button 
                                    onClick={handleDeleteRecord}
                                    disabled={deleteRecord.isPending}
                                    className="h-14 w-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center transition-all hover:bg-red-100 hover:scale-[1.02]">
                                    {deleteRecord.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PAGE HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    {selectedFolderId && (
                        <button onClick={() => setSelectedFolderId(null)}
                            className="flex items-center gap-1 text-[12px] font-black text-[#b0b0b0] hover:text-[#05050a] transition-colors mb-2">
                            <ArrowRight className="h-3 w-3 rotate-180" /> BACK TO ALL FOLDERS
                        </button>
                    )}
                    <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
                        {selectedFolder ? selectedFolder.name : "Records"}
                    </h1>
                    <p className="text-[15px] font-medium text-[#8a8a8a]">
                        {selectedFolder ? `Showing all records in ${selectedFolder.name}.` : "Your AI-organized medical history vault."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleCreateFolder} disabled={createFolder.isPending}
                        className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-5 py-3 text-[13px] font-black text-[#05050a] transition-all hover:shadow-md active:scale-95 disabled:opacity-50">
                        {createFolder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
                        NEW FOLDER
                    </button>
                    <Link href="/scanner">
                        <button className="flex items-center gap-2 rounded-xl bg-[#05050a] px-6 py-3 text-[13px] font-black text-[#b8ff00] shadow-xl shadow-black/10 transition-all hover:scale-[1.03] active:scale-95">
                            <Upload className="h-4 w-4" strokeWidth={3} /> UPLOAD RECORD
                        </button>
                    </Link>
                </div>
            </div>

            {/* ── SEARCH TOOLBAR ── */}
            <div className="flex items-center justify-between gap-4 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-black/5">
                <div className="flex items-center gap-2 flex-1 max-w-md px-4">
                    <Search className="h-4 w-4 text-[#b0b0b0] shrink-0" />
                    <input type="text" placeholder="Search by doctor, diagnosis, lab..."
                        className="bg-transparent border-none focus:outline-none text-sm font-medium w-full"
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex items-center gap-1 pr-2">
                    <button onClick={() => setView('grid')} className={cn("p-2 rounded-lg transition-all", view === 'grid' ? "bg-white shadow-sm text-[#05050a]" : "text-[#b0b0b0]")}>
                        <Grid className="h-4 w-4" />
                    </button>
                    <button onClick={() => setView('list')} className={cn("p-2 rounded-lg transition-all", view === 'list' ? "bg-white shadow-sm text-[#05050a]" : "text-[#b0b0b0]")}>
                        <ListIcon className="h-4 w-4" />
                    </button>
                    <div className="h-6 w-[1px] bg-black/5 mx-1" />
                    <button className="flex items-center gap-1 px-3 h-8 text-[11px] font-bold text-[#8a8a8a] hover:text-[#05050a]">
                        <Filter className="h-3.5 w-3.5" /> Filter
                    </button>
                </div>
            </div>

            {/* ── FOLDERS (only when no folder selected) ── */}
            {!selectedFolderId && (
                <div className="space-y-5">
                    <h3 className="text-[18px] font-black tracking-tight text-[#05050a] px-1">Folders</h3>
                    {(!folders || folders.length === 0) ? (
                        <div className="py-12 text-center border-2 border-dashed border-black/5 rounded-3xl">
                            <FolderIcon className="h-10 w-10 text-[#d0d0d0] mx-auto mb-3" />
                            <p className="text-[12px] font-bold text-[#b0b0b0] uppercase tracking-widest">No folders yet — upload a record to auto-create one</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                            {folders.map((folder) => (
                                <button key={folder.id} onClick={() => setSelectedFolderId(folder.id)}
                                    className="group flex flex-col p-6 bg-white rounded-[24px] border border-black/5 hover:border-[#b8ff00] hover:shadow-lg transition-all text-left relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-3">
                                        <FolderIcon className="h-9 w-9 text-[#05050a] group-hover:scale-110 transition-transform" />
                                        <button 
                                            onClick={(e) => handleDeleteFolder(e, folder.id)}
                                            className="p-1.5 text-[#d0d0d0] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <span className="text-[13px] font-black text-[#05050a] truncate w-full">{folder.name}</span>
                                    <span className="text-[10px] font-medium text-[#b0b0b0] mt-0.5">Open folder</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── RECORDS GRID / LIST ── */}
            <div className="space-y-5">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[18px] font-black tracking-tight text-[#05050a]">
                        {selectedFolderId ? `Records in "${selectedFolder?.name}"` : "All Records"}
                    </h3>
                    <span className="text-[12px] font-bold text-[#b0b0b0]">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="py-28 flex flex-col items-center justify-center bg-white/50 rounded-[40px] border-4 border-dashed border-black/5">
                        <FileText className="h-12 w-12 text-[#d0d0d0] mb-4" />
                        <h4 className="text-[18px] font-black text-[#05050a]">No Records Found</h4>
                        <p className="text-[#8a8a8a] text-sm font-medium mt-1 mb-7">
                            {searchQuery ? "Try a different search term." : "Upload a medical document to get started."}
                        </p>
                        <Link href="/scanner">
                            <button className="flex items-center gap-2 rounded-xl bg-[#b8ff00] px-7 py-3 text-[13px] font-black text-[#05050a] hover:scale-105 transition-all">
                                <Plus className="h-4 w-4" /> UPLOAD RECORD
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className={cn(
                        "gap-6",
                        view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
                    )}>
                        {filtered.map((record: any) => (
                            <div key={record.id} className={cn(
                                "group bg-white rounded-[28px] border border-black/5 border-t-[5px] border-t-[#b8ff00] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl",
                                view === 'list' ? "flex items-center gap-6 p-6" : "flex flex-col p-8 gap-6"
                            )}>
                                {/* Icon */}
                                <div className="h-14 w-14 rounded-[18px] bg-[#05050a] flex items-center justify-center text-[#b8ff00] shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-black/15">
                                    <FileText className="h-7 w-7" />
                                </div>

                                {/* Info */}
                                <div className={cn("flex-1 min-w-0", view === 'list' ? "" : "space-y-4")}>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className="bg-black/5 text-[#05050a] text-[9px] font-black border-none uppercase tracking-widest">
                                            {record.type === 'prescription' ? 'Prescription' : 'Lab Report'}
                                        </Badge>
                                        {record.isCritical && (
                                            <Badge className="bg-red-500 text-white text-[9px] font-black border-none uppercase tracking-widest animate-pulse">CRITICAL</Badge>
                                        )}
                                        <ConfidenceBadge value={record.aiConfidence} />
                                    </div>
                                    <h4 className="text-[17px] font-black text-[#05050a] truncate">
                                        {record.doctorName || record.labName || 'Medical Document'}
                                    </h4>
                                    <p className="text-[12px] font-bold text-[#b0b0b0] truncate">
                                        {record.clinicName || record.testName || record.diagnosis || 'General Health Record'}
                                    </p>
                                    {view !== 'list' && (
                                        <div className="flex gap-3">
                                            <div className="flex-1 p-3 rounded-xl bg-[#fafaf8] border border-black/5 text-center">
                                                <p className="text-[16px] font-black text-[#05050a]">
                                                    {record.type === 'prescription' ? (record.medicines?.length || 0) : (record.biomarkers?.length || 0)}
                                                </p>
                                                <p className="text-[8px] font-black text-[#b0b0b0] uppercase tracking-widest">
                                                    {record.type === 'prescription' ? 'Meds' : 'Markers'}
                                                </p>
                                            </div>
                                            <div className="flex-1 p-3 rounded-xl bg-[#fafaf8] border border-black/5 text-center">
                                                <p className="text-[11px] font-black text-[#05050a]">
                                                    {new Date(record.prescriptionDate || record.reportDate || record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                                <p className="text-[8px] font-black text-[#b0b0b0] uppercase tracking-widest">Date</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className={cn("flex gap-2 shrink-0", view === 'list' ? "flex-row" : "flex-row")}>
                                    <button onClick={() => setSelectedRecord(record)}
                                        className="flex items-center gap-2 px-4 h-11 bg-[#05050a] text-[#b8ff00] rounded-xl text-[12px] font-black hover:scale-105 transition-all shadow-md shadow-black/10">
                                        VIEW <ExternalLink className="h-3.5 w-3.5" />
                                    </button>
                                    <a href={record.fileUrl} download target="_blank" rel="noopener noreferrer">
                                        <button className="h-11 w-11 rounded-xl border-2 border-black/5 flex items-center justify-center hover:bg-black/5 transition-all text-[#05050a]">
                                            <Download className="h-4 w-4" />
                                        </button>
                                    </a>
                                    <button onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (confirm("Are you sure you want to delete this record?")) deleteRecord.mutate({ recordId: record.id, type: record.type }); 
                                    }}
                                        disabled={deleteRecord.isPending}
                                        className="h-11 w-11 rounded-xl border-2 border-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-50 hover:border-red-500/30 transition-all">
                                        {deleteRecord.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── SECURITY BANNER ── */}
            <div className="bg-gradient-to-r from-[#05050a] to-[#1a1a2e] rounded-[28px] p-8 text-white relative overflow-hidden">
                <Shield className="absolute right-8 top-1/2 -translate-y-1/2 h-32 w-32 text-white/5 rotate-12" />
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2 text-[#b8ff00]">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Military Grade Security</span>
                    </div>
                    <h2 className="text-[22px] font-black tracking-tight leading-tight max-w-md">
                        Your data is encrypted and only accessible by you and authorized doctors.
                    </h2>
                </div>
            </div>
        </div>
    );
}
