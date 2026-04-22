"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Star, MapPin, Globe, Clock, Video, Building, ChevronRight,
    Loader2, CheckCircle2, Calendar, User, IndianRupee, Award
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";

const TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
];

type DoctorProfile = {
    id: string;
    full_name: string;
    avatar_url: string | null;
    specialization: string | null;
    qualifications: string | null;
    experience_years: number | null;
    consultation_fee: number | null;
    avg_rating: string | null;
    total_reviews: number | null;
    languages_spoken: string[] | null;
    clinic_name: string | null;
    clinic_address: string | null;
    bio: string | null;
    is_available_now: boolean;
};

export default function DoctorProfileBookingPage() {
    const { id: doctorId } = useParams<{ id: string }>();
    const router = useRouter();
    const supabase = createClient();

    const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"about" | "reviews" | "book">("book");

    // Booking state
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedSlot, setSelectedSlot] = useState<string>("");
    const [appointmentType, setAppointmentType] = useState<"online" | "in_person">("online");
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [booking, setBooking] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationData, setConfirmationData] = useState<any>(null);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);

    // Generate next 14 days
    const next14Days = useMemo(() => {
        const days = [];
        const now = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() + i);
            days.push({
                date: d.toISOString().split("T")[0],
                day: d.toLocaleDateString("en-IN", { weekday: "short" }),
                num: d.getDate(),
                month: d.toLocaleDateString("en-IN", { month: "short" }),
                isSunday: d.getDay() === 0,
            });
        }
        return days;
    }, []);

    // Set default date
    useEffect(() => {
        const firstAvailable = next14Days.find((d) => !d.isSunday);
        if (firstAvailable) setSelectedDate(firstAvailable.date);
    }, [next14Days]);

    // Fetch doctor profile
    useEffect(() => {
        if (!doctorId) return;
        const fetch = async () => {
            const { data: profile } = await supabase
                .from("profiles")
                .select("id, full_name, avatar_url")
                .eq("id", doctorId)
                .single();

            const { data: dp } = await supabase
                .from("doctor_profiles")
                .select("*")
                .eq("user_id", doctorId)
                .single();

            if (profile && dp) {
                setDoctor({
                    id: profile.id,
                    full_name: profile.full_name || "Doctor",
                    avatar_url: profile.avatar_url,
                    specialization: dp.specialization,
                    qualifications: dp.qualifications,
                    experience_years: dp.experience_years,
                    consultation_fee: dp.consultation_fee,
                    avg_rating: dp.avg_rating,
                    total_reviews: dp.total_reviews,
                    languages_spoken: dp.languages_spoken,
                    clinic_name: dp.clinic_name,
                    clinic_address: dp.clinic_address,
                    bio: dp.bio,
                    is_available_now: dp.is_available_now ?? false,
                });
            }
            setLoading(false);
        };
        fetch();
    }, [doctorId]);

    // Fetch booked slots for selected date
    useEffect(() => {
        if (!doctorId || !selectedDate) return;
        const fetchBooked = async () => {
            const { data } = await supabase
                .from("appointments")
                .select("time_slot")
                .eq("doctor_id", doctorId)
                .eq("appointment_date", selectedDate)
                .neq("status", "cancelled");

            setBookedSlots(data?.map((a) => a.time_slot) || []);
        };
        fetchBooked();
        setSelectedSlot("");
    }, [doctorId, selectedDate]);

    // Fetch reviews
    useEffect(() => {
        if (!doctorId || tab !== "reviews") return;
        supabase
            .from("reviews")
            .select("*, profiles!reviews_patient_id_fkey(full_name)")
            .eq("doctor_id", doctorId)
            .order("created_at", { ascending: false })
            .then(({ data }) => { if (data) setReviews(data); });
    }, [doctorId, tab]);

    const handleBook = async () => {
        if (!selectedDate || !selectedSlot) return;
        setBooking(true);
        setBookingError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setBookingError("Please log in first."); setBooking(false); return; }

        const meetingLink = appointmentType === "online" ? crypto.randomUUID() : null;

        const { data, error } = await supabase
            .from("appointments")
            .insert({
                patient_id: user.id,
                doctor_id: doctorId,
                appointment_date: selectedDate,
                time_slot: selectedSlot,
                appointment_type: appointmentType,
                status: "confirmed",
                meeting_link: meetingLink,
            })
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                setBookingError("This slot was just booked by someone else. Please pick another.");
                setBookedSlots((prev) => [...prev, selectedSlot]);
                setSelectedSlot("");
            } else {
                setBookingError(error.message);
            }
            setBooking(false);
            return;
        }

        // Send notification to doctor
        await supabase.from("notifications").insert({
            id: crypto.randomUUID(),
            user_id: doctorId,
            title: "New Appointment Booked",
            message: `${user.email} booked an appointment on ${selectedDate} at ${selectedSlot}`,
            type: "appointment",
        }).catch(() => {});

        setConfirmationData({
            doctor_name: doctor?.full_name,
            date: selectedDate,
            time: selectedSlot,
            type: appointmentType,
            meeting_link: meetingLink,
        });
        setShowConfirmation(true);
        setBooking(false);
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-[#05050a]" />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-[15px] font-bold text-[#8a8a8a]">Doctor not found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-[1200px] mx-auto pb-20">
            {/* Doctor Header */}
            <div className="premium-card rounded-[32px] p-8 flex flex-col md:flex-row items-start gap-6">
                <div className="h-24 w-24 rounded-3xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] font-black text-[32px] shadow-xl flex-shrink-0">
                    {doctor.full_name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-[32px] font-black tracking-tighter text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                            {doctor.full_name}
                        </h1>
                        {doctor.is_available_now && (
                            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-black animate-pulse">AVAILABLE NOW</Badge>
                        )}
                    </div>
                    <p className="text-[14px] font-bold text-[#8a8a8a]">{doctor.specialization} • {doctor.qualifications}</p>
                    <div className="flex items-center gap-6 flex-wrap text-[13px] font-medium text-[#8a8a8a]">
                        <span className="flex items-center gap-1"><Award className="h-4 w-4" /> {doctor.experience_years || 0} yrs exp</span>
                        <span className="flex items-center gap-1"><Star className="h-4 w-4 text-[#b8ff00] fill-[#b8ff00]" /> {Number(doctor.avg_rating || 0).toFixed(1)} ({doctor.total_reviews || 0} reviews)</span>
                        <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4" /> ₹{doctor.consultation_fee || 0}</span>
                        {doctor.clinic_name && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {doctor.clinic_name}</span>}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-black/5 shadow-sm">
                {[
                    { key: "about", label: "About" },
                    { key: "reviews", label: "Reviews" },
                    { key: "book", label: "Book Appointment" },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key as any)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all",
                            tab === t.key ? "bg-[#05050a] text-[#b8ff00] shadow-lg" : "text-[#8a8a8a] hover:text-[#05050a] hover:bg-black/5"
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* About Tab */}
            {tab === "about" && (
                <div className="premium-card rounded-[32px] p-8 space-y-6">
                    {doctor.bio && <p className="text-[15px] font-medium text-[#1a1a2e] leading-relaxed">{doctor.bio}</p>}
                    {doctor.languages_spoken && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] mb-2">Languages</p>
                            <div className="flex gap-2 flex-wrap">
                                {doctor.languages_spoken.map((l) => (
                                    <Badge key={l} className="bg-black/5 text-[#05050a] rounded-lg text-[11px] font-bold px-3 py-1">{l}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    {doctor.clinic_address && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] mb-2">Clinic Address</p>
                            <p className="text-[14px] font-medium text-[#05050a]">{doctor.clinic_address}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Reviews Tab */}
            {tab === "reviews" && (
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="premium-card rounded-[24px] p-16 text-center">
                            <p className="text-[14px] font-bold text-[#8a8a8a]">No reviews yet</p>
                        </div>
                    ) : reviews.map((rev: any) => (
                        <div key={rev.id} className="premium-card rounded-[24px] p-6 space-y-3">
                            <div className="flex items-center gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("h-4 w-4", i < (rev.rating || 0) ? "text-[#b8ff00] fill-[#b8ff00]" : "text-[#e0e0e0]")} />
                                ))}
                                <span className="text-[12px] font-medium text-[#8a8a8a] ml-2">
                                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                                </span>
                            </div>
                            {rev.comment && <p className="text-[14px] font-medium text-[#1a1a2e]">{rev.comment}</p>}
                            <p className="text-[12px] font-bold text-[#8a8a8a]">— {rev.is_anonymous ? "Anonymous" : rev.profiles?.full_name || "Patient"}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Book Tab */}
            {tab === "book" && (
                <div className="space-y-8">
                    {/* Date Picker */}
                    <div className="space-y-4">
                        <h3 className="text-[18px] font-black tracking-tight text-[#05050a]">Select Date</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {next14Days.map((d) => (
                                <button
                                    key={d.date}
                                    disabled={d.isSunday}
                                    onClick={() => setSelectedDate(d.date)}
                                    className={cn(
                                        "flex flex-col items-center min-w-[72px] py-4 px-3 rounded-2xl transition-all text-center",
                                        d.isSunday ? "opacity-30 cursor-not-allowed bg-black/[0.02]" :
                                        selectedDate === d.date ? "bg-[#05050a] text-white shadow-xl scale-105" :
                                        "bg-white border border-black/5 hover:border-[#05050a] hover:shadow-md"
                                    )}
                                >
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", selectedDate === d.date ? "text-[#b8ff00]" : "text-[#b0b0b0]")}>{d.day}</span>
                                    <span className={cn("text-[24px] font-black", selectedDate === d.date ? "text-white" : "text-[#05050a]")}>{d.num}</span>
                                    <span className={cn("text-[10px] font-bold", selectedDate === d.date ? "text-white/60" : "text-[#b0b0b0]")}>{d.month}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-4">
                        <h3 className="text-[18px] font-black tracking-tight text-[#05050a]">Select Time</h3>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {TIME_SLOTS.map((slot) => {
                                const isBooked = bookedSlots.includes(slot);
                                return (
                                    <button
                                        key={slot}
                                        disabled={isBooked}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={cn(
                                            "py-3 rounded-xl text-[13px] font-black transition-all",
                                            isBooked ? "bg-black/[0.03] text-[#d0d0d0] cursor-not-allowed line-through" :
                                            selectedSlot === slot ? "bg-purple-600 text-white shadow-lg shadow-purple-200" :
                                            "bg-white border border-black/5 text-[#05050a] hover:border-purple-300 hover:shadow-md"
                                        )}
                                    >
                                        {slot}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Appointment Type */}
                    <div className="space-y-4">
                        <h3 className="text-[18px] font-black tracking-tight text-[#05050a]">Consultation Type</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setAppointmentType("online")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[13px] font-black transition-all",
                                    appointmentType === "online" ? "bg-[#05050a] text-[#b8ff00] shadow-xl" : "bg-white border border-black/5 text-[#05050a] hover:border-[#05050a]"
                                )}
                            >
                                <Video className="h-5 w-5" /> Online
                            </button>
                            <button
                                onClick={() => setAppointmentType("in_person")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[13px] font-black transition-all",
                                    appointmentType === "in_person" ? "bg-[#05050a] text-[#b8ff00] shadow-xl" : "bg-white border border-black/5 text-[#05050a] hover:border-[#05050a]"
                                )}
                            >
                                <Building className="h-5 w-5" /> In-Person
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {bookingError && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                            <p className="text-[13px] font-bold text-red-600">{bookingError}</p>
                        </div>
                    )}

                    {/* Confirm Button */}
                    <button
                        onClick={handleBook}
                        disabled={!selectedDate || !selectedSlot || booking}
                        className="w-full h-16 bg-[#05050a] text-[#b8ff00] rounded-2xl text-[15px] font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-black/10"
                    >
                        {booking ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> CONFIRM APPOINTMENT</>}
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && confirmationData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setShowConfirmation(false); router.push("/patient/appointments"); }}>
                    <div className="bg-white rounded-[32px] p-10 max-w-md w-full mx-4 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center space-y-3">
                            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                            <h2 className="text-[24px] font-black text-[#05050a]">Appointment Confirmed!</h2>
                        </div>
                        <div className="space-y-3 bg-black/[0.02] rounded-2xl p-5">
                            <div className="flex justify-between text-[13px]">
                                <span className="font-medium text-[#8a8a8a]">Doctor</span>
                                <span className="font-black text-[#05050a]">{confirmationData.doctor_name}</span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                                <span className="font-medium text-[#8a8a8a]">Date</span>
                                <span className="font-black text-[#05050a]">{new Date(confirmationData.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                                <span className="font-medium text-[#8a8a8a]">Time</span>
                                <span className="font-black text-[#05050a]">{confirmationData.time}</span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                                <span className="font-medium text-[#8a8a8a]">Type</span>
                                <span className="font-black text-[#05050a]">{confirmationData.type === "online" ? "Online" : "In-Person"}</span>
                            </div>
                            {confirmationData.meeting_link && (
                                <div className="flex justify-between text-[13px]">
                                    <span className="font-medium text-[#8a8a8a]">Meeting ID</span>
                                    <span className="font-black text-purple-600">{confirmationData.meeting_link.slice(0, 8)}...</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => { setShowConfirmation(false); router.push("/patient/appointments"); }}
                            className="w-full h-12 bg-[#05050a] text-[#b8ff00] rounded-xl text-[13px] font-black"
                        >
                            VIEW MY APPOINTMENTS
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
