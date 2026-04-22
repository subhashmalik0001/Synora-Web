"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search, UserPlus, ChevronRight, Loader2, Users, Eye,
    MailQuestion
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

type Patient = {
    id: string;
    full_name: string | null;
    blood_group: string | null;
    avatar_url: string | null;
    created_at: string | null;
};

type MyPatient = Patient & { added_at: string };

export default function DoctorPatientsPage() {
    const supabase = createClient();
    const [tab, setTab] = useState<"all" | "my">("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [allPatients, setAllPatients] = useState<Patient[]>([]);
    const [myPatients, setMyPatients] = useState<MyPatient[]>([]);
    const [myPatientIds, setMyPatientIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Get current user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    // Fetch all patients
    const fetchAllPatients = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from("profiles")
            .select("id, full_name, blood_group, avatar_url, created_at")
            .eq("role", "patient")
            .order("full_name", { ascending: true });

        if (debouncedSearch) {
            query = query.ilike("full_name", `%${debouncedSearch}%`);
        }

        const { data, error } = await query;
        if (!error && data) setAllPatients(data);
        setLoading(false);
    }, [debouncedSearch]);

    // Fetch my patients
    const fetchMyPatients = useCallback(async () => {
        if (!userId) return;
        const { data, error } = await supabase
            .from("doctor_patients")
            .select("added_at, patient_id, profiles!doctor_patients_patient_id_fkey(id, full_name, blood_group, avatar_url, created_at)")
            .eq("doctor_id", userId)
            .order("added_at", { ascending: false });

        if (!error && data) {
            const mapped: MyPatient[] = data.map((row: any) => ({
                id: row.profiles.id,
                full_name: row.profiles.full_name,
                blood_group: row.profiles.blood_group,
                avatar_url: row.profiles.avatar_url,
                created_at: row.profiles.created_at,
                added_at: row.added_at,
            }));
            setMyPatients(mapped);
            setMyPatientIds(new Set(mapped.map((p) => p.id)));
        }
    }, [userId]);

    useEffect(() => { fetchAllPatients(); }, [fetchAllPatients]);
    useEffect(() => { fetchMyPatients(); }, [fetchMyPatients]);

    const handleAddPatient = async (patientId: string) => {
        if (!userId) return;
        setAddingId(patientId);
        await supabase.from("doctor_patients").upsert(
            { doctor_id: userId, patient_id: patientId },
            { onConflict: "doctor_id,patient_id" }
        );
        setMyPatientIds((prev) => new Set(prev).add(patientId));
        await fetchMyPatients();
        setAddingId(null);
    };

    const displayedPatients = tab === "all" ? allPatients : myPatients;

    if (loading && allPatients.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-[#05050a]" />
                    <p className="text-[12px] font-bold text-[#b0b0b0] uppercase tracking-widest">Loading Patient Registry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
                        Patient Registry
                    </h1>
                    <p className="text-[15px] font-medium text-[#8a8a8a] max-w-sm">Search, add, and manage patients in your clinical practice.</p>
                </div>
            </div>

            {/* Tabs + Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center gap-2 px-2">
                    <button
                        onClick={() => setTab("all")}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                            tab === "all" ? "bg-[#05050a] text-[#b8ff00] shadow-lg" : "text-[#8a8a8a] hover:text-[#05050a] hover:bg-black/5"
                        )}
                    >
                        <Users className="h-3.5 w-3.5" /> All Patients
                    </button>
                    <button
                        onClick={() => setTab("my")}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                            tab === "my" ? "bg-[#05050a] text-[#b8ff00] shadow-lg" : "text-[#8a8a8a] hover:text-[#05050a] hover:bg-black/5"
                        )}
                    >
                        <UserPlus className="h-3.5 w-3.5" /> My Patients ({myPatients.length})
                    </button>
                </div>
                <div className="h-8 w-px bg-black/5 hidden lg:block" />
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b0b0b0] group-focus-within:text-[#05050a] transition-colors" />
                    <input
                        type="search"
                        placeholder="Search patients by name..."
                        className="w-full h-12 rounded-xl border-none bg-transparent pl-11 pr-4 text-[13px] font-bold text-[#05050a] focus:ring-0 placeholder:text-[#d0d0d0]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Patient Table */}
            <div className="premium-card rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-black/[0.04]">
                        <thead>
                            <tr className="bg-black/[0.01]">
                                <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Patient</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Blood Group</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Joined</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.04]">
                            {displayedPatients.map((patient) => (
                                <tr key={patient.id} className="group transition-all hover:bg-black/[0.01]">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] font-black text-[14px] shadow-lg shadow-black/5 transition-transform group-hover:scale-110">
                                                {patient.full_name?.[0]?.toUpperCase() || "P"}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[15px] font-black text-[#05050a] truncate tracking-tight">{patient.full_name || "Unknown Patient"}</span>
                                                <span className="text-[12px] font-medium text-[#8a8a8a]">ID: {patient.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {patient.blood_group ? (
                                            <Badge className="bg-red-50 text-red-600 border border-red-100 rounded-lg text-[11px] font-black px-2 py-1">{patient.blood_group}</Badge>
                                        ) : (
                                            <span className="text-[12px] text-[#d0d0d0] font-medium">—</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[13px] font-medium text-[#8a8a8a]">
                                            {patient.created_at ? new Date(patient.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {myPatientIds.has(patient.id) ? (
                                            <Link href={`/doctor/patients/${patient.id}`}>
                                                <button className="flex items-center gap-2 px-4 h-10 bg-[#05050a] text-[#b8ff00] rounded-xl text-[12px] font-black hover:scale-105 transition-all ml-auto">
                                                    <Eye className="h-4 w-4" /> VIEW RECORDS <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => handleAddPatient(patient.id)}
                                                disabled={addingId === patient.id}
                                                className="flex items-center gap-2 px-4 h-10 border-2 border-[#05050a] text-[#05050a] rounded-xl text-[12px] font-black hover:bg-[#05050a] hover:text-[#b8ff00] transition-all ml-auto disabled:opacity-50"
                                            >
                                                {addingId === patient.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                                ADD TO MY PATIENTS
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {displayedPatients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="h-24 w-24 rounded-[32px] bg-black/5 flex items-center justify-center">
                        <MailQuestion className="h-10 w-10 text-[#d0d0d0]" />
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-[20px] font-black text-[#05050a]">
                            {tab === "my" ? "No patients added yet" : "No patient found with that name"}
                        </h3>
                        <p className="text-[14px] font-medium text-[#8a8a8a] max-w-sm">
                            {tab === "my" ? "Search above to find and add patients to your practice." : "Try broadening your search."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
