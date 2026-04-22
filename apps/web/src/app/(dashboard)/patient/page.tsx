"use client";

import { useState, useEffect } from "react";
import {
    Activity, Heart, Thermometer, Droplets, Loader2, Plus, Calendar,
    FileText, ChevronRight, Pill, CheckCircle2, TrendingUp, Stethoscope
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function PatientDashboard() {
    const supabase = createClient();
    const { data: session } = trpc.settings.getProfile.useQuery();

    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [latestVitals, setLatestVitals] = useState<any>(null);
    const [upcomingAppts, setUpcomingAppts] = useState<any[]>([]);
    const [activeMeds, setActiveMeds] = useState<any[]>([]);
    const [vitalsChart, setVitalsChart] = useState<any[]>([]);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    useEffect(() => {
        if (!userId) return;
        const fetchAll = async () => {
            setLoading(true);
            const today = new Date().toISOString().split("T")[0];

            // Latest vitals
            const { data: vitals } = await supabase
                .from("health_vitals")
                .select("*")
                .eq("patient_id", userId)
                .order("recorded_at", { ascending: false })
                .limit(1);
            if (vitals && vitals.length > 0) setLatestVitals(vitals[0]);

            // Upcoming appointments
            const { data: appts } = await supabase
                .from("appointments")
                .select("*")
                .eq("patient_id", userId)
                .gte("appointment_date", today)
                .eq("status", "confirmed")
                .order("appointment_date", { ascending: true })
                .limit(3);

            if (appts && appts.length > 0) {
                const doctorIds = [...new Set(appts.map((a) => a.doctor_id))];
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("id, full_name")
                    .in("id", doctorIds);
                const { data: dpData } = await supabase
                    .from("doctor_profiles")
                    .select("user_id, specialization")
                    .in("user_id", doctorIds);

                const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
                const dpMap = new Map(dpData?.map((d) => [d.user_id, d]) || []);

                setUpcomingAppts(appts.map((a) => ({
                    ...a,
                    doctor_name: profileMap.get(a.doctor_id)?.full_name || "Doctor",
                    specialization: dpMap.get(a.doctor_id)?.specialization || "",
                })));
            }

            // Latest prescriptions for active meds
            const { data: rxData } = await supabase
                .from("prescriptions")
                .select("medicines")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(1);
            if (rxData && rxData.length > 0 && Array.isArray(rxData[0].medicines)) {
                setActiveMeds(rxData[0].medicines.slice(0, 3));
            }

            // Vitals chart (last 7 entries)
            const { data: vChart } = await supabase
                .from("health_vitals")
                .select("heart_rate, spo2, recorded_at")
                .eq("patient_id", userId)
                .order("recorded_at", { ascending: true })
                .limit(14);
            if (vChart) {
                setVitalsChart(vChart.map((v: any) => ({
                    date: new Date(v.recorded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
                    revenue: v.heart_rate || 0,
                })));
            }

            setLoading(false);
        };
        fetchAll();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#05050a]" />
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-[1400px] mx-auto pb-20">
            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-8 space-y-2">
                    <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-[1.1]" style={{ fontFamily: "var(--font-display)" }}>
                        Your health <span className="text-[#b8ff00] bg-[#05050a] px-3 rounded-xl inline-block rotate-[-1deg]">simplified</span>,<br />Synora Medical.
                    </h1>
                    <p className="text-[15px] font-medium text-[#8a8a8a] max-w-md">
                        Welcome back, {(session as any)?.user?.name || "Patient"}.
                        {latestVitals ? " Your vitals are being tracked." : " Connect your device to start tracking vitals."}
                    </p>
                </div>
                <div className="lg:col-span-4 flex justify-end gap-3">
                    <Link href="/patient/doctors">
                        <button className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-5 py-3 text-[13px] font-bold text-[#05050a] transition-all hover:premium-shadow active:scale-95">
                            <Calendar className="h-4 w-4" /> Book Appointment
                        </button>
                    </Link>
                    <Link href="/patient/vitals">
                        <button className="flex items-center gap-2 rounded-xl bg-[#05050a] px-5 py-3 text-[13px] font-bold text-[#b8ff00] shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95">
                            <Plus className="h-4 w-4" /> Log Vitals
                        </button>
                    </Link>
                </div>
            </div>

            {/* Main Card */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Wellness Chart */}
                <div className="xl:col-span-8 premium-card rounded-[32px] p-8 md:p-10 flex flex-col gap-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Heart Rate Trend</p>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-[54px] font-black tracking-tighter text-[#05050a]">
                                    {latestVitals?.heart_rate || "—"}<span className="text-[24px] text-[#8a8a8a]"> BPM</span>
                                </h2>
                                {latestVitals && (
                                    <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-lg px-2 py-1 text-[12px] font-bold">
                                        <TrendingUp className="h-3 w-3 mr-1" /> Tracked
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-[340px] w-full">
                        {vitalsChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={vitalsChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="premiumRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#b8ff00" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#b8ff00" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#d0d0d0", fontSize: 11, fontWeight: 700 }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ stroke: "#05050a", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                                        content={({ active, payload }: any) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-[#05050a] text-white p-4 rounded-2xl shadow-2xl border border-white/10">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0] mb-1">{payload[0].payload.date}</p>
                                                        <p className="text-[18px] font-black text-[#b8ff00]">{payload[0].value} BPM</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#05050a" strokeWidth={4} fillOpacity={1} fill="url(#premiumRev)" animationDuration={2000} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-[14px] font-bold text-[#b0b0b0]">No vitals logged yet — connect your Synora device</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vitals Sidebar */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="premium-card rounded-[32px] p-8 flex flex-col justify-between flex-1 relative overflow-hidden group border-l-[6px] border-l-red-500">
                        <Heart className="absolute -right-6 -bottom-6 h-32 w-32 text-red-500/5 transition-transform group-hover:scale-110" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Blood Pressure</p>
                            <h3 className="text-[42px] font-black tracking-tighter text-[#05050a]">
                                {latestVitals?.blood_pressure_systolic ? `${latestVitals.blood_pressure_systolic}/${latestVitals.blood_pressure_diastolic}` : "—"}
                            </h3>
                        </div>
                        <div className="pt-6">
                            {latestVitals ? (
                                <>
                                    <div className="flex items-center gap-1 text-[12px] font-bold text-emerald-500 mb-2">
                                        <CheckCircle2 className="h-4 w-4 text-[#b8ff00]" />
                                        <span>SpO2: {latestVitals.spo2 || "—"}%</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-[#8a8a8a]">
                                        Recorded {new Date(latestVitals.recorded_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                    </p>
                                </>
                            ) : (
                                <p className="text-[11px] font-medium text-[#8a8a8a]">No vitals logged yet</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#05050a] rounded-[32px] p-8 text-white flex flex-col justify-between h-[200px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                            <Activity className="h-8 w-8 text-[#b8ff00]" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Temperature</p>
                            <p className="text-[15px] font-bold leading-snug">
                                {latestVitals?.temperature_c
                                    ? <>Latest reading: <span className="text-[#b8ff00]">{latestVitals.temperature_c}°C</span></>
                                    : "No temperature data logged yet."
                                }
                            </p>
                        </div>
                        <Link href="/patient/health">
                            <button className="text-[11px] font-black uppercase tracking-widest text-[#b8ff00] flex items-center gap-2 group-hover:gap-3 transition-all">
                                View Full Report <ChevronRight className="h-3 w-3" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>Upcoming Appointments</h3>
                        <Link href="/patient/appointments"><button className="text-[12px] font-bold text-[#b0b0b0] hover:text-[#05050a] transition-colors">View All</button></Link>
                    </div>
                    <div className="premium-card rounded-[32px] overflow-hidden">
                        <div className="divide-y divide-black/[0.04]">
                            {upcomingAppts.length > 0 ? (
                                upcomingAppts.map((app: any) => (
                                    <div key={app.id} className="flex items-center gap-4 px-8 py-6 transition-colors hover:bg-black/[0.01] group">
                                        <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center text-[#b8ff00] font-black text-[12px] shadow-lg shadow-black/5 group-hover:scale-110 transition-transform">
                                            {app.doctor_name?.[0]?.toUpperCase() || "D"}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[15px] font-black text-[#05050a] truncate">{app.doctor_name}</span>
                                            <span className="text-[12px] font-medium text-[#8a8a8a] truncate">{app.specialization || "Doctor"} • {app.appointment_type === "online" ? "Video Call" : "In-Person"}</span>
                                        </div>
                                        <div className="ml-auto flex flex-col items-end gap-1">
                                            <Badge className="bg-[#b8ff00]/10 text-[#05050a] border border-[#b8ff00]/20 rounded-lg text-[10px] uppercase font-black">
                                                {app.appointment_type === "online" ? "Video" : "Clinic"}
                                            </Badge>
                                            <span className="text-[11px] font-bold text-[#b0b0b0]">
                                                {new Date(app.appointment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} • {app.time_slot}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center">
                                    <p className="text-[13px] font-bold text-[#b0b0b0]">No upcoming consultations.</p>
                                    <Link href="/patient/doctors">
                                        <button className="mt-4 px-4 py-2 bg-[#05050a] text-[#b8ff00] rounded-xl text-[12px] font-black">Find a Doctor</button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Medications */}
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-[20px] font-black tracking-tight text-[#05050a] px-2" style={{ fontFamily: "var(--font-display)" }}>Active Medications</h3>
                    <div className="space-y-4">
                        {activeMeds.length > 0 ? (
                            activeMeds.map((med: any, idx: number) => (
                                <div key={idx} className="premium-card rounded-[24px] p-6 flex items-center gap-5 transition-all text-left group">
                                    <div className="h-12 w-12 rounded-2xl bg-[#b8ff00]/10 flex items-center justify-center text-[#05050a] transition-transform group-hover:rotate-6">
                                        <Pill className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-black text-[#05050a]">{med.name || "Medicine"}</span>
                                        <span className="text-[12px] font-medium text-[#8a8a8a]">{med.dosage || ""} • {med.frequency || ""}</span>
                                    </div>
                                    <div className="ml-auto h-2 w-2 rounded-full bg-[#b8ff00] animate-pulse" />
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="premium-card rounded-[24px] p-6 flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-black/5 flex items-center justify-center text-[#05050a]">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-black text-[#05050a]">No active medications</span>
                                        <span className="text-[12px] font-medium text-[#8a8a8a]">Upload a prescription to get started</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
