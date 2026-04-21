"use client";

import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="landing-page min-h-screen relative overflow-hidden flex items-center justify-center bg-[#fafaf8] p-4 lg:p-8">
            {/* Medical Shield watermark */}
            <div
                className="pointer-events-none absolute select-none font-display font-black"
                style={{
                    fontSize: "clamp(300px, 40vw, 600px)",
                    color: "rgba(5, 5, 10, 0.03)",
                    left: "-5%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    lineHeight: 1,
                    zIndex: 0
                }}
                aria-hidden="true"
            >
                ✚
            </div>

            <main className="relative z-10 flex flex-col lg:flex-row w-full max-w-[1240px] min-h-[820px] bg-white rounded-[48px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.08)] border border-black/5">
                {/* Left panel — Branding (Desktop only) */}
                <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative bg-[#05050a]">
                    <div>
                        <div className="flex items-center gap-3 font-display text-2xl font-black" style={{ color: "#fafaf8" }}>
                            <span className="h-8 w-8 bg-[#fafaf8] rounded-lg flex items-center justify-center text-[#05050a] text-sm">S</span>
                            SYNORA
                        </div>
                    </div>

                    <div className="space-y-10">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-display font-black text-6xl leading-[0.95]"
                            style={{ color: "#fafaf8" }}
                        >
                            Precision care. <br />
                            <span className="font-serif-accent italic text-[#b8ff00]">Restored</span> <br />
                            in real-time.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="font-body text-lg max-w-sm font-medium text-white/50 leading-relaxed"
                        >
                            Sync clinical-grade vitals, automate patient alerts, 
                            and digitize records via one unified platform.
                        </motion.p>

                        <div className="grid grid-cols-2 gap-px bg-white/5 max-w-sm mt-10 border border-white/5 rounded-3xl overflow-hidden">
                            {[
                                { label: "Cases Monitored", value: "2,400+" },
                                { label: "Vitals Synced", value: "1.2M+" },
                                { label: "Alerts Prevented", value: "24K+" },
                                { label: "Latency", value: "< 2s" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="bg-[#05050a] p-7"
                                >
                                    <p className="font-display font-black text-3xl text-[#b8ff00]">{stat.value}</p>
                                    <p className="font-mono-dm text-[9px] uppercase tracking-[0.2em] mt-1 font-black text-white/30">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <p className="font-mono-dm text-[10px] uppercase tracking-[0.2em] font-black text-white/20">
                        © 2026 SYNORA HEALTHTECH. CLINICAL GRADE IOT.
                    </p>
                </div>

                {/* Right panel — Auth Form */}
                <div className="flex flex-1 items-center justify-center p-8 lg:p-20 bg-mesh-light relative">
                    <div className="w-full max-w-sm">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}


