"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Activity, FileText, ArrowRight, ArrowLeft, CheckCircle, Loader2, Hospital, Stethoscope, Briefcase, Phone, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const roles = [
    { id: "patient", label: "Patient", icon: User, description: "I want to manage my health records and book appointments." },
    { id: "doctor", label: "Doctor", icon: Stethoscope, description: "I want to manage patients and conduct consultations." },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<"patient" | "doctor" | null>(null);

    // Patient Fields
    const [patientData, setPatientData] = useState({
        fullName: "",
        phone: "",
        bloodGroup: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
    });

    // Doctor Fields
    const [doctorData, setDoctorData] = useState({
        fullName: "",
        specialization: "",
        qualifications: "",
        experienceYears: 0,
        registrationNumber: "",
        clinicName: "",
        clinicAddress: "",
        consultationFee: 0,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mutations (Assuming these will be implemented in the TRPC routers)
    const completeOnboarding = trpc.settings.completeOnboarding.useMutation({
        onSuccess: () => {
            router.push(role === 'doctor' ? '/doctor' : '/patient');
        },
    });

    const handleRoleSelect = (selectedRole: "patient" | "doctor") => {
        setRole(selectedRole);
        setStep(2);
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            await completeOnboarding.mutateAsync({
                role,
                ...(role === 'patient' ? patientData : doctorData)
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mx-auto"
        >
            <div className="mb-8 text-center space-y-2">
                <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-[var(--paper)]">
                    Curator <span className="text-[var(--gold)]">Medical+</span>
                </h1>
                <p className="font-mono-dm text-sm text-[var(--dim)]">
                    Setup your medical profile.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="role-selection"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6 lg:p-10 relative overflow-hidden space-y-6"
                        style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--line)",
                        }}
                    >
                        <div className="space-y-1">
                            <h2 className="font-display font-bold text-xl text-[var(--paper)]">Choose Your Role</h2>
                            <p className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)]">How will you be using Curator?</p>
                        </div>

                        <div className="grid gap-4">
                            {roles.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => handleRoleSelect(r.id as "patient" | "doctor")}
                                    className="group text-left p-6 border border-[var(--line)] bg-[var(--ink)] hover:border-[var(--gold)] transition-all relative overflow-hidden"
                                >
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#05050a] border border-white/5 text-[var(--gold)] group-hover:scale-110 transition-transform">
                                            <r.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-lg text-[var(--paper)]">{r.label}</h3>
                                            <p className="text-xs text-[var(--dim)]">{r.description}</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="h-5 w-5 text-[var(--gold)]" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && role === 'patient' && (
                    <motion.div
                        key="patient-setup"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6 lg:p-10 relative overflow-hidden space-y-6"
                        style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--line)",
                        }}
                    >
                        <div className="flex items-center gap-4 mb-2">
                             <button onClick={() => setStep(1)} className="text-[var(--dim)] hover:text-[var(--paper)] transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                             </button>
                             <div className="space-y-1">
                                <h2 className="font-display font-bold text-xl text-[var(--paper)]">Personal Details</h2>
                                <p className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)]">Basic info for your records</p>
                             </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)] font-bold">Full Name</label>
                                <input
                                    type="text"
                                    value={patientData.fullName}
                                    onChange={(e) => setPatientData({ ...patientData, fullName: e.target.value })}
                                    className="w-full h-12 px-4 bg-[var(--ink)] border border-[var(--line)] font-mono-dm text-sm text-[var(--paper)] focus:outline-none focus:border-[var(--gold)] transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)] font-bold">Phone</label>
                                    <input
                                        type="tel"
                                        value={patientData.phone}
                                        onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                                        className="w-full h-12 px-4 bg-[var(--ink)] border border-[var(--line)] font-mono-dm text-sm text-[var(--paper)] focus:outline-none focus:border-[var(--gold)] transition-colors"
                                        placeholder="+91..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)] font-bold">Blood Group</label>
                                    <input
                                        type="text"
                                        value={patientData.bloodGroup}
                                        onChange={(e) => setPatientData({ ...patientData, bloodGroup: e.target.value })}
                                        className="w-full h-12 px-4 bg-[var(--ink)] border border-[var(--line)] font-mono-dm text-sm text-[var(--paper)] focus:outline-none focus:border-[var(--gold)] transition-colors"
                                        placeholder="O+"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-[var(--ink)] border border-[var(--line)] space-y-4">
                                <p className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)] font-bold">Emergency Contact</p>
                                <div className="grid gap-4">
                                    <input
                                        type="text"
                                        placeholder="Contact Name"
                                        value={patientData.emergencyContactName}
                                        onChange={(e) => setPatientData({ ...patientData, emergencyContactName: e.target.value })}
                                        className="w-full h-10 px-4 bg-transparent border border-[var(--line)] font-mono-dm text-xs text-[var(--paper)] focus:outline-none focus:border-[var(--gold)]"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Contact Phone"
                                        value={patientData.emergencyContactPhone}
                                        onChange={(e) => setPatientData({ ...patientData, emergencyContactPhone: e.target.value })}
                                        className="w-full h-10 px-4 bg-transparent border border-[var(--line)] font-mono-dm text-xs text-[var(--paper)] focus:outline-none focus:border-[var(--gold)]"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleFinish}
                            disabled={!patientData.fullName || isSubmitting}
                            className="cta-primary w-full h-12 bg-[var(--acid)] text-[var(--ink)] font-display font-extrabold text-lg flex items-center justify-center tracking-tight transition-transform hover:scale-[1.02]"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Complete Setup <CheckCircle className="ml-2 h-4 w-4" /></>}
                        </button>
                    </motion.div>
                )}

                {step === 2 && role === 'doctor' && (
                    <motion.div
                        key="doctor-setup"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6 lg:p-10 relative overflow-hidden space-y-6"
                        style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--line)",
                        }}
                    >
                         <div className="flex items-center gap-4 mb-2">
                             <button onClick={() => setStep(1)} className="text-[var(--dim)] hover:text-[var(--paper)] transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                             </button>
                             <div className="space-y-1">
                                <h2 className="font-display font-bold text-xl text-[var(--paper)]">Professional Profile</h2>
                                <p className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)]">Verify your medical credentials</p>
                             </div>
                        </div>

                        <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                            <div className="space-y-1.5">
                                <label className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)] font-bold">Full Name (Dr.)</label>
                                <input
                                    type="text"
                                    value={doctorData.fullName}
                                    onChange={(e) => setDoctorData({ ...doctorData, fullName: e.target.value })}
                                    className="w-full h-12 px-4 bg-[var(--ink)] border border-[var(--line)] font-mono-dm text-sm text-[var(--paper)] focus:outline-none focus:border-[var(--gold)]"
                                    placeholder="Dr. Gregory House"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)] font-bold">Specialization</label>
                                    <input
                                        type="text"
                                        value={doctorData.specialization}
                                        onChange={(e) => setDoctorData({ ...doctorData, specialization: e.target.value })}
                                        className="w-full h-12 px-4 bg-[var(--ink)] border border-[var(--line)] font-mono-dm text-sm text-[var(--paper)] focus:outline-none focus:border-[var(--gold)]"
                                        placeholder="Cardiology"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)] font-bold">Experience (Years)</label>
                                    <input
                                        type="number"
                                        value={doctorData.experienceYears || ""}
                                        onChange={(e) => setDoctorData({ ...doctorData, experienceYears: parseInt(e.target.value) })}
                                        className="w-full h-12 px-4 bg-[var(--ink)] border border-[var(--line)] font-mono-dm text-sm text-[var(--paper)] focus:outline-none focus:border-[var(--gold)]"
                                        placeholder="10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)] font-bold">Clinic / hospital Name</label>
                                <input
                                    type="text"
                                    value={doctorData.clinicName}
                                    onChange={(e) => setDoctorData({ ...doctorData, clinicName: e.target.value })}
                                    className="w-full h-12 px-4 bg-[var(--ink)] border border-[var(--line)] font-mono-dm text-sm text-[var(--paper)] focus:outline-none focus:border-[var(--gold)]"
                                    placeholder="Princeton-Plainsboro"
                                />
                            </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)] font-bold">Reg. Number</label>
                                    <input
                                        type="text"
                                        value={doctorData.registrationNumber}
                                        onChange={(e) => setDoctorData({ ...doctorData, registrationNumber: e.target.value })}
                                        className="w-full h-12 px-4 bg-[var(--ink)] border border-[var(--line)] font-mono-dm text-sm text-[var(--paper)] focus:outline-none focus:border-[var(--gold)]"
                                        placeholder="MCI-12345"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono-dm text-[10px] uppercase tracking-widest text-[var(--dim)] font-bold">Consultation Fee (₹)</label>
                                    <input
                                        type="number"
                                        value={doctorData.consultationFee || ""}
                                        onChange={(e) => setDoctorData({ ...doctorData, consultationFee: parseInt(e.target.value) })}
                                        className="w-full h-12 px-4 bg-[var(--ink)] border border-[var(--line)] font-mono-dm text-sm text-[var(--paper)] focus:outline-none focus:border-[var(--gold)]"
                                        placeholder="500"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleFinish}
                            disabled={!doctorData.fullName || !doctorData.registrationNumber || isSubmitting}
                            className="cta-primary w-full h-12 bg-[var(--gold)] text-[var(--ink)] font-display font-extrabold text-lg flex items-center justify-center tracking-tight transition-transform hover:scale-[1.02]"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Register Profile <ArrowRight className="ml-2 h-4 w-4" /></>}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
