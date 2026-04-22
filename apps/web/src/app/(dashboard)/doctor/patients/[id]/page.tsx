"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
    User, Heart, Thermometer, Droplets, Activity, FileText, FlaskConical,
    Calendar, ChevronRight, Loader2, Download, AlertTriangle, Wifi, WifiOff,
    Pill, Clock, CheckCircle2, XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Tab = "overview" | "prescriptions" | "lab_reports" | "vitals" | "appointments";

export default function PatientRecordPage() {
    const { id: patientId } = useParams<{ id: string }>();
    const supabase = createClient();
    const [tab, setTab] = useState<Tab>("overview");
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState<any>(null);
    const [latestVitals, setLatestVitals] = useState<any>(null);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [labReports, setLabReports] = useState<any[]>([]);
    const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [vitalsRange, setVitalsRange] = useState("1M");
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id);
        });
    }, []);

    // Fetch patient profile
    useEffect(() => {
        if (!patientId) return;
        const fetchPatient = async () => {
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", patientId)
                .single();
            setPatient(data);
        };
        fetchPatient();
    }, [patientId]);

    // Fetch latest vitals
    useEffect(() => {
        if (!patientId) return;
        const fetchVitals = async () => {
            const { data } = await supabase
                .from("health_vitals")
                .select("*")
                .eq("patient_id", patientId)
                .order("recorded_at", { ascending: false })
                .limit(1);
            if (data && data.length > 0) setLatestVitals(data[0]);
        };
        fetchVitals().then(() => setLoading(false));
    }, [patientId]);

    // Fetch prescriptions
    useEffect(() => {
        if (!patientId || tab !== "prescriptions") return;
        supabase
            .from("prescriptions")
            .select("*")
            .eq("user_id", patientId)
            .order("created_at", { ascending: false })
            .then(({ data }) => { if (data) setPrescriptions(data); });
    }, [patientId, tab]);

    // Fetch lab reports
    useEffect(() => {
        if (!patientId || tab !== "lab_reports") return;
        supabase
            .from("lab_reports")
            .select("*")
            .eq("user_id", patientId)
            .order("created_at", { ascending: false })
            .then(({ data }) => { if (data) setLabReports(data); });
    }, [patientId, tab]);

    // Fetch vitals history
    useEffect(() => {
        if (!patientId || tab !== "vitals") return;
        const now = new Date();
        let from = new Date();
        if (vitalsRange === "1W") from.setDate(now.getDate() - 7);
        else if (vitalsRange === "1M") from.setMonth(now.getMonth() - 1);
        else from.setMonth(now.getMonth() - 3);

        supabase
            .from("health_vitals")
            .select("*")
            .eq("patient_id", patientId)
            .gte("recorded_at", from.toISOString())
            .order("recorded_at", { ascending: true })
            .limit(100)
            .then(({ data }) => { if (data) setVitalsHistory(data); });
    }, [patientId, tab, vitalsRange]);

    // Fetch appointments
    useEffect(() => {
        if (!patientId || !userId || tab !== "appointments") return;
        supabase
            .from("appointments")
            .select("*")
            .eq("doctor_id", userId)
            .eq("patient_id", patientId)
            .order("appointment_date", { ascending: false })
            .then(({ data }) => { if (data) setAppointments(data); });
    }, [patientId, userId, tab]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-[#05050a]" />
            </div>
        );
    }

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: "overview", label: "Overview", icon: User },
        { key: "prescriptions", label: "Prescriptions", icon: Pill },
        { key: "lab_reports", label: "Lab Reports", icon: FlaskConical },
        { key: "vitals", label: "Vitals History", icon: Activity },
        { key: "appointments", label: "Appointments", icon: Calendar },
    ];

    return (
        <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
            {/* Patient Header */}
            <div className="premium-card rounded-[32px] p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="h-20 w-20 rounded-3xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] font-black text-[28px] shadow-xl">
                    {patient?.full_name?.[0]?.toUpperCase() || "P"}
                </div>
                <div className="flex-1 space-y-1">
                    <h1 className="text-[32px] font-black tracking-tighter text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                        {patient?.full_name || "Unknown Patient"}
                    </h1>
                    <div className="flex items-center gap-4 text-[13px] font-medium text-[#8a8a8a]">
                        {patient?.blood_group && <Badge className="bg-red-50 text-red-600 border border-red-100 rounded-lg text-[11px] font-black">{patient.blood_group}</Badge>}
                        <span>ID: {patientId?.slice(0, 8).toUpperCase()}</span>
                        {patient?.phone && <span>📞 {patient.phone}</span>}
                    </div>
                </div>
                {patient?.emergency_contact_name && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3 text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Emergency Contact</p>
                        <p className="text-[14px] font-black text-red-600">{patient.emergency_contact_name}</p>
                        <p className="text-[12px] font-medium text-red-500">{patient.emergency_contact_phone}</p>
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-black/5 shadow-sm overflow-x-auto">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                            tab === t.key ? "bg-[#05050a] text-[#b8ff00] shadow-lg" : "text-[#8a8a8a] hover:text-[#05050a] hover:bg-black/5"
                        )}
                    >
                        <t.icon className="h-3.5 w-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {tab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[
                        { label: "Heart Rate", value: latestVitals?.heart_rate ? `${latestVitals.heart_rate} BPM` : "—", icon: Heart, color: "red" },
                        { label: "Blood Pressure", value: latestVitals?.blood_pressure_systolic ? `${latestVitals.blood_pressure_systolic}/${latestVitals.blood_pressure_diastolic}` : "—", icon: Activity, color: "blue" },
                        { label: "SpO2", value: latestVitals?.spo2 ? `${latestVitals.spo2}%` : "—", icon: Droplets, color: "cyan" },
                        { label: "Temperature", value: latestVitals?.temperature_c ? `${latestVitals.temperature_c}°C` : "—", icon: Thermometer, color: "orange" },
                    ].map((vital) => (
                        <div key={vital.label} className="premium-card rounded-[24px] p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">{vital.label}</p>
                                <vital.icon className="h-5 w-5 text-[#d0d0d0]" />
                            </div>
                            <h3 className="text-[32px] font-black tracking-tighter text-[#05050a]">{vital.value}</h3>
                            <p className="text-[11px] font-medium text-[#8a8a8a]">
                                {latestVitals?.recorded_at
                                    ? `Recorded ${new Date(latestVitals.recorded_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
                                    : "No vitals logged yet — connect your Synora device"}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {tab === "prescriptions" && (
                <div className="space-y-6">
                    {prescriptions.length === 0 ? (
                        <EmptyState message="No prescriptions uploaded yet" />
                    ) : (
                        prescriptions.map((rx) => (
                            <div key={rx.id} className="premium-card rounded-[24px] p-8 space-y-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-[18px] font-black text-[#05050a]">{rx.clinic_name || "Clinic"}</h3>
                                        <p className="text-[13px] font-medium text-[#8a8a8a]">Dr. {rx.doctor_name || "Unknown"} • {rx.prescription_date || "—"}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {rx.ai_confidence && (
                                            <Badge className="bg-[#b8ff00]/10 text-[#05050a] border border-[#b8ff00]/20 rounded-lg text-[10px] font-black">
                                                AI {Math.round(Number(rx.ai_confidence) * 100)}%
                                            </Badge>
                                        )}
                                        <button
                                            onClick={async () => {
                                                const { data } = await supabase.storage.from("medical-records").createSignedUrl(rx.file_url, 60);
                                                if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                                            }}
                                            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-black/5 text-[11px] font-black text-[#05050a] hover:bg-black/5 transition-all"
                                        >
                                            <Download className="h-3.5 w-3.5" /> Download
                                        </button>
                                    </div>
                                </div>
                                {rx.diagnosis && (
                                    <div className="bg-black/[0.02] rounded-xl p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] mb-1">Diagnosis</p>
                                        <p className="text-[14px] font-bold text-[#05050a]">{rx.diagnosis}</p>
                                    </div>
                                )}
                                {rx.medicines && Array.isArray(rx.medicines) && (
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] mb-3">Medicines</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {(rx.medicines as any[]).map((med: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3 bg-black/[0.02] rounded-xl p-3">
                                                    <Pill className="h-4 w-4 text-[#b8ff00]" />
                                                    <div>
                                                        <p className="text-[13px] font-black text-[#05050a]">{med.name}</p>
                                                        <p className="text-[11px] font-medium text-[#8a8a8a]">{med.dosage} • {med.frequency}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === "lab_reports" && (
                <div className="space-y-6">
                    {labReports.length === 0 ? (
                        <EmptyState message="No lab reports uploaded yet" />
                    ) : (
                        labReports.map((report) => (
                            <div key={report.id} className="premium-card rounded-[24px] p-8 space-y-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-[18px] font-black text-[#05050a]">{report.test_name || "Lab Test"}</h3>
                                            {report.is_critical && <Badge className="bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-black">CRITICAL</Badge>}
                                        </div>
                                        <p className="text-[13px] font-medium text-[#8a8a8a]">{report.lab_name || "Lab"} • {report.report_date || "—"}</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const { data } = await supabase.storage.from("medical-records").createSignedUrl(report.file_url, 60);
                                            if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                                        }}
                                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-black/5 text-[11px] font-black text-[#05050a] hover:bg-black/5 transition-all"
                                    >
                                        <Download className="h-3.5 w-3.5" /> Download
                                    </button>
                                </div>
                                {report.biomarkers && Array.isArray(report.biomarkers) && (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-black/[0.04]">
                                            <thead>
                                                <tr className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0]">
                                                    <th className="py-3 pr-6 text-left">Biomarker</th>
                                                    <th className="py-3 px-6 text-left">Value</th>
                                                    <th className="py-3 px-6 text-left">Unit</th>
                                                    <th className="py-3 px-6 text-left">Normal Range</th>
                                                    <th className="py-3 pl-6 text-left">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-black/[0.04]">
                                                {(report.biomarkers as any[]).map((bm: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="py-3 pr-6 text-[13px] font-bold text-[#05050a]">{bm.name}</td>
                                                        <td className="py-3 px-6 text-[13px] font-black text-[#05050a]">{bm.value}</td>
                                                        <td className="py-3 px-6 text-[12px] text-[#8a8a8a]">{bm.unit}</td>
                                                        <td className="py-3 px-6 text-[12px] text-[#8a8a8a]">{bm.normal_range || "—"}</td>
                                                        <td className="py-3 pl-6">
                                                            <Badge className={cn(
                                                                "rounded-lg text-[10px] font-black",
                                                                bm.status === "in_range" || bm.status === "normal"
                                                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                    : "bg-red-50 text-red-600 border border-red-100"
                                                            )}>
                                                                {bm.status === "in_range" || bm.status === "normal" ? "Normal" : "Out of Range"}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === "vitals" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[20px] font-black tracking-tight text-[#05050a]">Vitals Trend</h3>
                        <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
                            {["1W", "1M", "3M"].map((r) => (
                                <button key={r} onClick={() => setVitalsRange(r)} className={cn(
                                    "px-4 py-1.5 text-[11px] font-black rounded-lg transition-all",
                                    vitalsRange === r ? "bg-white text-[#05050a] shadow-sm" : "text-[#8a8a8a] hover:text-[#05050a]"
                                )}>{r}</button>
                            ))}
                        </div>
                    </div>
                    {vitalsHistory.length === 0 ? (
                        <EmptyState message="No vitals logged yet — connect your Synora device" />
                    ) : (
                        <div className="premium-card rounded-[32px] p-8">
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={vitalsHistory.map((v) => ({
                                        ...v,
                                        time: new Date(v.recorded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
                                    }))}>
                                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#d0d0d0", fontSize: 11, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#d0d0d0", fontSize: 11 }} />
                                        <Tooltip contentStyle={{ background: "#05050a", border: "none", borderRadius: 16, color: "white" }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="heart_rate" stroke="#ef4444" strokeWidth={3} dot={false} name="Heart Rate" />
                                        <Line type="monotone" dataKey="spo2" stroke="#06b6d4" strokeWidth={3} dot={false} name="SpO2" />
                                        <Line type="monotone" dataKey="temperature_c" stroke="#f97316" strokeWidth={3} dot={false} name="Temp (°C)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tab === "appointments" && (
                <div className="space-y-4">
                    {appointments.length === 0 ? (
                        <EmptyState message="No appointments booked with this patient yet" />
                    ) : (
                        appointments.map((appt) => (
                            <div key={appt.id} className="premium-card rounded-[24px] p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Calendar className="h-5 w-5 text-[#b0b0b0]" />
                                    <div>
                                        <p className="text-[15px] font-black text-[#05050a]">
                                            {new Date(appt.appointment_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                        </p>
                                        <p className="text-[13px] font-medium text-[#8a8a8a]">{appt.time_slot} • {appt.appointment_type === "online" ? "Online" : "In-Person"}</p>
                                    </div>
                                </div>
                                <Badge className={cn(
                                    "rounded-lg text-[10px] font-black px-3 py-1",
                                    appt.status === "confirmed" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                    appt.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    "bg-red-50 text-red-600 border border-red-100"
                                )}>
                                    {appt.status?.toUpperCase()}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-black/5 flex items-center justify-center">
                <FileText className="h-8 w-8 text-[#d0d0d0]" />
            </div>
            <p className="text-[14px] font-bold text-[#8a8a8a]">{message}</p>
        </div>
    );
}
