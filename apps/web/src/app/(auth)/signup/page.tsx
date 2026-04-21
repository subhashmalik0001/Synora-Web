"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Sparkles, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"doctor" | "patient">("patient");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: role,
                },
            },
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            // Success - take them to onboarding
            router.push("/onboarding");
            router.refresh();
        }
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-center space-y-3">
                <div className="mx-auto h-14 w-14 rounded-[20px] bg-[#05050a] flex items-center justify-center shadow-2xl shadow-black/10">
                    <ShieldCheck className="h-7 w-7 text-[#b8ff00]" />
                </div>
                <h1 className="text-[36px] font-black tracking-tighter text-[#05050a] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    Join Synora.
                </h1>
                <p className="text-[15px] font-medium text-[#8a8a8a] max-w-[320px] mx-auto leading-relaxed">
                    The next generation of clinical management 
                    and remote oversight.
                </p>
            </div>

                <form onSubmit={handleSignup} className="space-y-6 mt-10">
                    <div className="grid grid-cols-2 gap-4 p-1.5 bg-black/[0.03] rounded-[24px]">
                        {["patient", "doctor"].map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r as any)}
                                className={cn(
                                    "py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all",
                                    role === r 
                                        ? "bg-[#05050a] text-[#b8ff00] shadow-xl" 
                                        : "text-[#8a8a8a] hover:text-[#05050a]"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b0b0b0] ml-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-2xl border border-black/[0.04] bg-black/[0.02] px-6 py-5 text-[14px] font-medium transition-all focus:border-[#b8ff00] focus:ring-0 outline-none"
                            placeholder="Dr. John Doe"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b0b0b0] ml-1">Clinical Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-2xl border border-black/[0.04] bg-black/[0.02] px-6 py-5 text-[14px] font-medium transition-all focus:border-[#b8ff00] focus:ring-0 outline-none"
                            placeholder="name@clinic.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b0b0b0] ml-1">Security Key</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border border-black/[0.04] bg-black/[0.02] px-6 py-5 text-[14px] font-medium transition-all focus:border-[#b8ff00] focus:ring-0 outline-none"
                            placeholder="Min. 8 characters"
                        />
                    </div>

                    {error && (
                        <div className="rounded-2xl bg-red-50 p-4 border border-red-100/50">
                            <p className="text-[12px] font-bold text-red-500">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[64px] flex items-center justify-center gap-2 rounded-2xl bg-[#05050a] text-[15px] font-black text-[#b8ff00] shadow-2xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-4"
                    >
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>CREATE ACCOUNT <ArrowRight className="h-5 w-5" /></>}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-[14px] font-medium text-[#8a8a8a]">
                        Already active?{" "}
                        <Link href="/login" className="font-black text-[#05050a] hover:underline underline-offset-4">
                            Sign in to Portal
                        </Link>
                    </p>
                </div>

        </div>

    );
}

// Helper function to handle conditional classes
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
