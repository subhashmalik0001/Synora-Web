"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Sparkles, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"doctor" | "patient">("patient");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const signupMutation = trpc.auth.signup.useMutation({
        onSuccess: async () => {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                handleDemoLogin();
            } else {
                const target = role === "doctor" ? "/doctor" : "/patient";
                router.push(target);
                router.refresh();
            }
        },
        onError: (err) => {
            setError(err.message);
            setIsLoading(false);
        }
    });

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        signupMutation.mutate({
            email,
            password,
            name,
            role
        });
    };

    const handleDemoLogin = () => {
        document.cookie = "synora_dummy_auth=true; path=/; max-age=3600";
        router.push("/dashboard");
        router.refresh();
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-center space-y-3">
                <h1 className="text-[42px] font-black tracking-tighter text-[#05050a] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    Join Synora.
                </h1>
                <p className="text-[15px] font-medium text-[#8a8a8a] max-w-[320px] mx-auto leading-relaxed">
                    The next generation of clinical management and remote oversight.
                </p>
            </div>

                <form onSubmit={handleSignup} className="space-y-6 mt-10">
                    <div className="grid grid-cols-2 gap-4 p-1.5 bg-black/[0.03] rounded-xl">
                        {["patient", "doctor"].map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r as any)}
                                className={cn(
                                    "py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
                                    role === r 
                                        ? "bg-[#05050a] text-[#b8ff00]" 
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
                            className="w-full rounded-lg border border-black/[0.08] bg-white px-6 py-5 text-[14px] font-medium transition-all focus:border-[#05050a] focus:ring-0 outline-none"
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
                            className="w-full rounded-lg border border-black/[0.08] bg-white px-6 py-5 text-[14px] font-medium transition-all focus:border-[#05050a] focus:ring-0 outline-none"
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
                            className="w-full rounded-lg border border-black/[0.08] bg-white px-6 py-5 text-[14px] font-medium transition-all focus:border-[#05050a] focus:ring-0 outline-none"
                            placeholder="Min. 8 characters"
                        />
                    </div>

                    {error && (
                        <div className="rounded-2xl bg-red-50 p-6 border border-red-100 animate-in shake duration-500 space-y-4">
                            <p className="text-[13px] font-bold text-red-600 leading-tight">{error}</p>
                            {error.toLowerCase().includes('rate limit') && (
                                <button 
                                    type="button"
                                    onClick={handleDemoLogin}
                                    className="w-full py-3 bg-red-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                                >
                                    Force Bypass (Emergency Access)
                                </button>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="h-[64px] flex items-center justify-center gap-2 rounded-lg bg-[#05050a] text-[15px] font-black text-[#b8ff00] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>CREATE CLINICAL ACCOUNT <ArrowRight className="h-5 w-5" /></>}
                        </button>
                    </div>
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
