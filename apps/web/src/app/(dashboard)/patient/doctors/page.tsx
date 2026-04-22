"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search, Star, MapPin, Clock, Globe, Video, Filter,
    Loader2, ChevronRight, Stethoscope, IndianRupee
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

const SPECIALIZATIONS = [
    "All", "General Physician", "Cardiologist", "Neurologist", "Dermatologist",
    "Orthopedic", "Gynecologist", "Pediatrician", "Psychiatrist", "ENT", "Ophthalmologist"
];

type Doctor = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    specialization: string | null;
    qualifications: string | null;
    experience_years: number | null;
    consultation_fee: number | null;
    avg_rating: string | null;
    languages_spoken: string[] | null;
    clinic_name: string | null;
    clinic_address: string | null;
    is_available_now: boolean;
};

export default function PatientDoctorsPage() {
    const supabase = createClient();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [specFilter, setSpecFilter] = useState("All");
    const [availableOnly, setAvailableOnly] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchDoctors = useCallback(async () => {
        setLoading(true);

        // Fetch doctor profiles (full_name is on doctor_profiles table directly)
        let dpQuery = supabase
            .from("doctor_profiles")
            .select("user_id, full_name, profile_photo, specialization, qualifications, experience_years, consultation_fee, avg_rating, languages_spoken, clinic_name, clinic_address, is_available_now");

        if (specFilter !== "All") {
            dpQuery = dpQuery.eq("specialization", specFilter);
        }
        if (availableOnly) {
            dpQuery = dpQuery.eq("is_available_now", true);
        }
        if (debouncedSearch) {
            dpQuery = dpQuery.ilike("full_name", `%${debouncedSearch}%`);
        }

        const { data: dpData } = await dpQuery;

        if (!dpData || dpData.length === 0) {
            setDoctors([]);
            setLoading(false);
            return;
        }

        const merged: Doctor[] = dpData.map((dp) => ({
            id: dp.user_id,
            full_name: dp.full_name,
            avatar_url: dp.profile_photo,
            specialization: dp.specialization,
            qualifications: dp.qualifications,
            experience_years: dp.experience_years,
            consultation_fee: dp.consultation_fee,
            avg_rating: dp.avg_rating,
            languages_spoken: dp.languages_spoken,
            clinic_name: dp.clinic_name,
            clinic_address: dp.clinic_address,
            is_available_now: dp.is_available_now ?? false,
        })).sort((a, b) => Number(b.avg_rating || 0) - Number(a.avg_rating || 0));

        setDoctors(merged);
        setLoading(false);
    }, [debouncedSearch, specFilter, availableOnly]);

    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

    if (loading && doctors.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-[#05050a]" />
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
                    Find a Doctor
                </h1>
                <p className="text-[15px] font-medium text-[#8a8a8a] max-w-md">Browse verified doctors on the Synora platform and book your appointment.</p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-black/5 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b0b0b0] group-focus-within:text-[#05050a] transition-colors" />
                    <input
                        type="search"
                        placeholder="Search doctors by name..."
                        className="w-full h-12 rounded-xl border-none bg-transparent pl-11 pr-4 text-[13px] font-bold text-[#05050a] focus:ring-0 placeholder:text-[#d0d0d0]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="h-8 w-px bg-black/5 hidden lg:block" />
                <select
                    value={specFilter}
                    onChange={(e) => setSpecFilter(e.target.value)}
                    className="h-12 rounded-xl border border-black/5 bg-white px-4 text-[12px] font-black text-[#05050a] focus:ring-0 focus:border-[#05050a] appearance-none cursor-pointer"
                >
                    {SPECIALIZATIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <button
                    onClick={() => setAvailableOnly(!availableOnly)}
                    className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-xl text-[12px] font-black transition-all",
                        availableOnly ? "bg-emerald-500 text-white" : "border border-black/5 text-[#8a8a8a] hover:text-[#05050a]"
                    )}
                >
                    <div className={cn("h-2 w-2 rounded-full", availableOnly ? "bg-white animate-pulse" : "bg-emerald-400")} />
                    Available Now
                </button>
            </div>

            {/* Doctor Cards Grid */}
            {doctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Stethoscope className="h-16 w-16 text-[#d0d0d0]" />
                    <h3 className="text-[20px] font-black text-[#05050a]">No doctors found</h3>
                    <p className="text-[14px] font-medium text-[#8a8a8a]">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {doctors.map((doc) => (
                        <div key={doc.id} className="premium-card rounded-[24px] p-6 flex flex-col gap-5 transition-all hover:shadow-xl group">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] font-black text-[20px] shadow-lg transition-transform group-hover:scale-110">
                                    {doc.full_name?.[0]?.toUpperCase() || "D"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[16px] font-black text-[#05050a] truncate tracking-tight">{doc.full_name || "Doctor"}</h3>
                                        {doc.is_available_now && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" title="Available Now" />
                                        )}
                                    </div>
                                    <p className="text-[12px] font-bold text-[#8a8a8a]">{doc.specialization || "General"}</p>
                                    {doc.qualifications && <p className="text-[11px] font-medium text-[#b0b0b0]">{doc.qualifications}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/[0.02] rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0]">Experience</p>
                                    <p className="text-[16px] font-black text-[#05050a]">{doc.experience_years || 0} yrs</p>
                                </div>
                                <div className="bg-black/[0.02] rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0]">Fee</p>
                                    <p className="text-[16px] font-black text-[#05050a]">₹{doc.consultation_fee || 0}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Star className="h-4 w-4 text-[#b8ff00] fill-[#b8ff00]" />
                                    <span className="text-[14px] font-black text-[#05050a]">{Number(doc.avg_rating || 0).toFixed(1)}</span>
                                </div>
                                {doc.languages_spoken && doc.languages_spoken.length > 0 && (
                                    <div className="flex items-center gap-1 text-[11px] font-medium text-[#8a8a8a]">
                                        <Globe className="h-3 w-3" />
                                        {doc.languages_spoken.slice(0, 2).join(", ")}
                                    </div>
                                )}
                            </div>

                            {doc.clinic_name && (
                                <div className="flex items-center gap-2 text-[12px] font-medium text-[#8a8a8a]">
                                    <MapPin className="h-3.5 w-3.5 text-[#b0b0b0]" />
                                    {doc.clinic_name}
                                </div>
                            )}

                            <Link href={`/patient/doctors/${doc.id}`} className="mt-auto">
                                <button className="w-full flex items-center justify-center gap-2 h-12 bg-[#05050a] text-[#b8ff00] rounded-xl text-[13px] font-black transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    BOOK APPOINTMENT <ChevronRight className="h-4 w-4" />
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
