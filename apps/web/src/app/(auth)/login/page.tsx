"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-center space-y-3">
                <div className="mx-auto h-14 w-14 rounded-[20px] bg-[#05050a] flex items-center justify-center shadow-2xl shadow-black/10">
                    <Sparkles className="h-7 w-7 text-[#b8ff00]" />
                </div>
                <h1 className="text-[36px] font-black tracking-tighter text-[#05050a] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    Welcome back.
                </h1>
                <p className="text-[15px] font-medium text-[#8a8a8a] max-w-[280px] mx-auto leading-relaxed">
                    Sign in to the Synora clinical 
                    <br />
                    ecosystem to continue.
                </p>
            </div>

                <form onSubmit={handleLogin} className="space-y-6 mt-10">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b0b0b0] ml-1">Account Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-2xl border border-black/[0.04] bg-black/[0.02] px-6 py-5 text-[14px] font-medium placeholder:text-[#d0d0d0] focus:border-[#b8ff00] focus:ring-0 transition-all outline-none"
                            placeholder="name@clinical.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Access Key</label>
                            <button type="button" className="text-[10px] font-black uppercase tracking-widest text-[#8a8a8a] hover:text-[#05050a]">Forgot?</button>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border border-black/[0.04] bg-black/[0.02] px-6 py-5 text-[14px] font-medium placeholder:text-[#d0d0d0] focus:border-[#b8ff00] focus:ring-0 transition-all outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="rounded-2xl bg-red-50 p-4 border border-red-100/50 animate-in shake duration-500">
                            <p className="text-[12px] font-bold text-red-500">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[64px] flex items-center justify-center gap-2 rounded-2xl bg-[#05050a] text-[15px] font-black text-[#b8ff00] shadow-2xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-4"
                    >
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>AUTHORIZE ACCESS <ArrowRight className="h-5 w-5" /></>}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-[14px] font-medium text-[#8a8a8a]">
                        New to Synora?{" "}
                        <Link href="/signup" className="font-black text-[#05050a] hover:underline underline-offset-4">
                            Join the Waitlist
                        </Link>
                    </p>
                </div>

        </div>

    );
}
