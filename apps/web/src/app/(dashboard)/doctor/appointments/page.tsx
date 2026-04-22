"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Calendar, Clock, Video, MapPin, ChevronRight, Loader2,
    CheckCircle2, XCircle, Phone, User, Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

type Appointment = {
    id: string;
    patient_id: string;
    appointment_date: string;
    time_slot: string;
    appointment_type: string;
    status: string;
    meeting_link: string | null;
    notes: string | null;
    created_at: string;
    patient_name?: string;
    avatar_url?: string;
    blood_group?: string;
};

export default function DoctorAppointmentsPage() {
    const supabase = createClient();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    const fetchAppointments = useCallback(async () => {
        if (!userId) return;
        setLoading(true);

        // Fetch appointments then join patient names manually
        const { data: appts } = await supabase
            .from("appointments")
            .select("*")
            .eq("doctor_id", userId)
            .order("appointment_date", { ascending: true });

        if (appts && appts.length > 0) {
            const patientIds = [...new Set(appts.map((a) => a.patient_id))];
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, avatar_url, blood_group")
                .in("id", patientIds);

            const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

            const enriched: Appointment[] = appts.map((a) => ({
                ...a,
                patient_name: profileMap.get(a.patient_id)?.full_name || "Unknown",
                avatar_url: profileMap.get(a.patient_id)?.avatar_url,
                blood_group: profileMap.get(a.patient_id)?.blood_group,
            }));
            setAppointments(enriched);
        } else {
            setAppointments([]);
        }
        setLoading(false);
    }, [userId]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    // Realtime subscription
    useEffect(() => {
        if (!userId) return;
        const channel = supabase
            .channel("doctor-appointments")
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "appointments",
                filter: `doctor_id=eq.${userId}`,
            }, () => {
                fetchAppointments();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId, fetchAppointments]);

    const handleStatusUpdate = async (id: string, status: string) => {
        setUpdatingId(id);
        await supabase.from("appointments").update({ status }).eq("id", id);
        await fetchAppointments();
        setUpdatingId(null);
    };

    const today = new Date().toISOString().split("T")[0];
    const todayAppts = appointments.filter((a) => a.appointment_date === today && a.status !== "cancelled");
    const upcomingAppts = appointments.filter((a) => a.appointment_date > today && a.status === "confirmed");
    const pastAppts = appointments.filter((a) => a.appointment_date < today || a.status === "completed" || a.status === "cancelled");

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-[#05050a]" />
            </div>
        );
    }

    const renderAppointmentCard = (appt: Appointment) => (
        <div key={appt.id} className="premium-card rounded-[24px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-lg">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] font-black text-[16px] shadow-lg shadow-black/5">
                    {appt.patient_name?.[0]?.toUpperCase() || "P"}
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <p className="text-[16px] font-black text-[#05050a] tracking-tight">{appt.patient_name}</p>
                        {appt.blood_group && <Badge className="bg-red-50 text-red-600 border border-red-100 rounded-lg text-[9px] font-black">{appt.blood_group}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[12px] font-medium text-[#8a8a8a]">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(appt.appointment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {appt.time_slot}</span>
                        <Badge className={cn(
                            "rounded-lg text-[9px] font-black",
                            appt.appointment_type === "online" ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                        )}>
                            {appt.appointment_type === "online" ? <><Video className="h-3 w-3 mr-1" />Online</> : <><MapPin className="h-3 w-3 mr-1" />In-Person</>}
                        </Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn(
                    "rounded-lg text-[10px] font-black px-3 py-1",
                    appt.status === "confirmed" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                    appt.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                    appt.status === "cancelled" ? "bg-red-50 text-red-600 border border-red-100" :
                    "bg-yellow-50 text-yellow-600 border border-yellow-100"
                )}>
                    {appt.status?.toUpperCase()}
                </Badge>

                {appt.appointment_type === "online" && appt.appointment_date === today && appt.status === "confirmed" && (
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-[11px] font-black hover:bg-purple-700 transition-all">
                        <Video className="h-3.5 w-3.5" /> START CALL
                    </button>
                )}

                {appt.status === "confirmed" && (
                    <>
                        <button
                            onClick={() => handleStatusUpdate(appt.id, "completed")}
                            disabled={updatingId === appt.id}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black hover:bg-emerald-100 transition-all disabled:opacity-50"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(appt.id, "cancelled")}
                            disabled={updatingId === appt.id}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[11px] font-black hover:bg-red-100 transition-all disabled:opacity-50"
                        >
                            <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                    </>
                )}

                <Link href={`/doctor/patients/${appt.patient_id}`}>
                    <button className="flex items-center gap-1.5 px-3 py-2 border border-black/5 text-[#05050a] rounded-xl text-[11px] font-black hover:bg-black/5 transition-all">
                        <Eye className="h-3.5 w-3.5" /> Records
                    </button>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
            <div className="space-y-2">
                <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
                    Appointments
                </h1>
                <p className="text-[15px] font-medium text-[#8a8a8a]">Manage your consultations in real-time.</p>
            </div>

            {/* Today */}
            <div className="space-y-4">
                <h2 className="text-[18px] font-black tracking-tight text-[#05050a] flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#b8ff00] animate-pulse" /> Today ({todayAppts.length})
                </h2>
                {todayAppts.length === 0 ? (
                    <div className="premium-card rounded-[24px] p-10 text-center">
                        <p className="text-[13px] font-bold text-[#b0b0b0]">No appointments today</p>
                    </div>
                ) : todayAppts.map(renderAppointmentCard)}
            </div>

            {/* Upcoming */}
            <div className="space-y-4">
                <h2 className="text-[18px] font-black tracking-tight text-[#05050a]">Upcoming ({upcomingAppts.length})</h2>
                {upcomingAppts.length === 0 ? (
                    <div className="premium-card rounded-[24px] p-10 text-center">
                        <p className="text-[13px] font-bold text-[#b0b0b0]">No upcoming appointments</p>
                    </div>
                ) : upcomingAppts.map(renderAppointmentCard)}
            </div>

            {/* Past */}
            <div className="space-y-4">
                <h2 className="text-[18px] font-black tracking-tight text-[#8a8a8a]">Past ({pastAppts.length})</h2>
                {pastAppts.length === 0 ? (
                    <div className="premium-card rounded-[24px] p-10 text-center">
                        <p className="text-[13px] font-bold text-[#b0b0b0]">No past appointments</p>
                    </div>
                ) : pastAppts.map(renderAppointmentCard)}
            </div>
        </div>
    );
}
