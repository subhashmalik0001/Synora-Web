"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Calendar, Clock, Video, MapPin, ChevronRight, Loader2,
    CheckCircle2, XCircle, Star, Stethoscope, RefreshCw, MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

type Appointment = {
    id: string;
    doctor_id: string;
    appointment_date: string;
    time_slot: string;
    appointment_type: string;
    status: string;
    meeting_link: string | null;
    notes: string | null;
    created_at: string;
    doctor_name?: string;
    avatar_url?: string;
    specialization?: string;
    clinic_name?: string;
    consultation_fee?: number;
};

export default function PatientAppointmentsPage() {
    const supabase = createClient();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
    const [userId, setUserId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    const fetchAppointments = useCallback(async () => {
        if (!userId) return;
        setLoading(true);

        const { data: appts } = await supabase
            .from("appointments")
            .select("*")
            .eq("patient_id", userId)
            .order("appointment_date", { ascending: false });

        if (appts && appts.length > 0) {
            const doctorIds = [...new Set(appts.map((a) => a.doctor_id))];

            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, avatar_url")
                .in("id", doctorIds);

            const { data: dpData } = await supabase
                .from("doctor_profiles")
                .select("user_id, specialization, clinic_name, consultation_fee")
                .in("user_id", doctorIds);

            const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
            const dpMap = new Map(dpData?.map((d) => [d.user_id, d]) || []);

            const enriched: Appointment[] = appts.map((a) => ({
                ...a,
                doctor_name: profileMap.get(a.doctor_id)?.full_name || "Doctor",
                avatar_url: profileMap.get(a.doctor_id)?.avatar_url,
                specialization: dpMap.get(a.doctor_id)?.specialization,
                clinic_name: dpMap.get(a.doctor_id)?.clinic_name,
                consultation_fee: dpMap.get(a.doctor_id)?.consultation_fee,
            }));
            setAppointments(enriched);
        } else {
            setAppointments([]);
        }
        setLoading(false);
    }, [userId]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    const handleCancel = async (id: string) => {
        setCancellingId(id);
        await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
        await fetchAppointments();
        setCancellingId(null);
    };

    const today = new Date().toISOString().split("T")[0];

    const filteredAppointments = appointments.filter((a) => {
        if (filter === "upcoming") return a.appointment_date >= today && a.status === "confirmed";
        if (filter === "completed") return a.status === "completed";
        if (filter === "cancelled") return a.status === "cancelled";
        return true;
    });

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-[#05050a]" />
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
                        My Appointments
                    </h1>
                    <p className="text-[15px] font-medium text-[#8a8a8a]">Track all your consultations and follow-ups.</p>
                </div>
                <Link href="/patient/doctors">
                    <button className="flex items-center gap-2 rounded-xl bg-[#05050a] px-6 py-3.5 text-[14px] font-black text-[#b8ff00] shadow-xl shadow-black/10 transition-all hover:scale-[1.05] active:scale-95">
                        <Stethoscope className="h-5 w-5" /> FIND DOCTOR
                    </button>
                </Link>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 flex-wrap">
                {(["all", "upcoming", "completed", "cancelled"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all",
                            filter === f ? "bg-[#05050a] text-[#b8ff00] shadow-lg" : "bg-white border border-black/5 text-[#8a8a8a] hover:text-[#05050a]"
                        )}
                    >
                        {f} ({appointments.filter((a) => {
                            if (f === "upcoming") return a.appointment_date >= today && a.status === "confirmed";
                            if (f === "completed") return a.status === "completed";
                            if (f === "cancelled") return a.status === "cancelled";
                            return true;
                        }).length})
                    </button>
                ))}
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <Calendar className="h-16 w-16 text-[#d0d0d0]" />
                    <div className="text-center space-y-1">
                        <h3 className="text-[20px] font-black text-[#05050a]">No appointments booked yet</h3>
                        <p className="text-[14px] font-medium text-[#8a8a8a]">Find a doctor and schedule your first consultation.</p>
                    </div>
                    <Link href="/patient/doctors">
                        <button className="px-6 py-3 bg-[#05050a] text-[#b8ff00] rounded-xl text-[13px] font-black">Browse Doctors</button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAppointments.map((appt) => (
                        <div key={appt.id} className="premium-card rounded-[24px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] font-black text-[16px] shadow-lg shadow-black/5">
                                    {appt.doctor_name?.[0]?.toUpperCase() || "D"}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[16px] font-black text-[#05050a] tracking-tight">{appt.doctor_name}</p>
                                    </div>
                                    <p className="text-[12px] font-bold text-[#8a8a8a]">{appt.specialization || "Doctor"} {appt.clinic_name ? `• ${appt.clinic_name}` : ""}</p>
                                    <div className="flex items-center gap-3 mt-1 text-[12px] font-medium text-[#8a8a8a]">
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(appt.appointment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {appt.time_slot}</span>
                                        <Badge className={cn(
                                            "rounded-lg text-[9px] font-black",
                                            appt.appointment_type === "online" ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                                        )}>
                                            {appt.appointment_type === "online" ? "Online" : "In-Person"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={cn(
                                    "rounded-lg text-[10px] font-black px-3 py-1",
                                    appt.status === "confirmed" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                    appt.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    "bg-red-50 text-red-600 border border-red-100"
                                )}>
                                    {appt.status?.toUpperCase()}
                                </Badge>

                                {appt.appointment_type === "online" && appt.appointment_date === today && appt.status === "confirmed" && (
                                    <button className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-[11px] font-black hover:bg-purple-700 transition-all">
                                        <Video className="h-3.5 w-3.5" /> JOIN CALL
                                    </button>
                                )}

                                {appt.status === "confirmed" && appt.appointment_date >= today && (
                                    <button
                                        onClick={() => handleCancel(appt.id)}
                                        disabled={cancellingId === appt.id}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[11px] font-black hover:bg-red-100 transition-all disabled:opacity-50"
                                    >
                                        {cancellingId === appt.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} Cancel
                                    </button>
                                )}

                                {appt.status === "completed" && (
                                    <button className="flex items-center gap-1.5 px-3 py-2 border border-[#b8ff00] text-[#05050a] rounded-xl text-[11px] font-black hover:bg-[#b8ff00]/10 transition-all">
                                        <Star className="h-3.5 w-3.5" /> Review
                                    </button>
                                )}

                                {appt.status === "cancelled" && (
                                    <Link href={`/patient/doctors/${appt.doctor_id}`}>
                                        <button className="flex items-center gap-1.5 px-3 py-2 border border-black/5 text-[#05050a] rounded-xl text-[11px] font-black hover:bg-black/5 transition-all">
                                            <RefreshCw className="h-3.5 w-3.5" /> Rebook
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
