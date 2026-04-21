"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import HeroMockup from "./HeroMockup";

const lineVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.3 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    }),
};

export default function Hero() {
    return (
        <section className="relative min-h-screen grid-bg overflow-hidden pt-16" style={{ background: "var(--paper)" }}>
            {/* Medical Shield watermark */}
            <div
                className="pointer-events-none absolute select-none font-display font-bold"
                style={{
                    fontSize: "clamp(300px, 40vw, 600px)",
                    color: "var(--line)",
                    opacity: 0.1,
                    right: "-5%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    lineHeight: 1,
                }}
                aria-hidden="true"
            >
                ✚
            </div>

            <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-0 lg:min-h-screen flex items-center">
                <div className="grid w-full grid-cols-1 gap-16 lg:grid-cols-5">
                    {/* Left — Text content (3/5) */}
                    <div className="lg:col-span-3 flex flex-col justify-center">
                        {/* Tag */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="font-mono-dm text-[10px] uppercase tracking-[0.2em] font-black"
                            style={{ color: "var(--dim)" }}
                        >
                            [ HEALTH-TECH #02 • REMOTE PATIENT MONITORING ]
                        </motion.div>

                        {/* Headline */}
                        <h1 className="mt-8">
                            <motion.span
                                custom={0}
                                initial="hidden"
                                animate="visible"
                                variants={lineVariants}
                                className="block font-display font-black leading-[0.95]"
                                style={{ fontSize: "var(--fs-hero)", color: "var(--ink)" }}
                            >
                                Care at your
                            </motion.span>
                            <motion.span
                                custom={1}
                                initial="hidden"
                                animate="visible"
                                variants={lineVariants}
                                className="block font-serif-accent leading-[1] italic"
                                style={{ fontSize: "var(--fs-hero)", color: "var(--electric)" }}
                            >
                                fingertips.
                            </motion.span>
                        </h1>

                        {/* Sub */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="mt-8 max-w-xl font-body text-lg leading-relaxed text-[#1a1a2e]"
                        >
                            Synora is an AI-powered telemedicine ecosystem that 
                            restores dignity, safety, and independence to those who need it most. 
                            Real-time vitals monitoring meets a smart EHR system.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1, duration: 0.4 }}
                            className="mt-10 flex flex-wrap items-center gap-5"
                        >
                            <Link
                                href="/signup"
                                className="cta-primary font-display text-[15px] font-black px-10 py-5 bg-[#05050a] text-[#b8ff00] rounded-2xl transition-transform hover:scale-[1.05] active:scale-[0.98]"
                            >
                                Get Started Free →
                            </Link>
                            <a
                                href="#monitoring"
                                className="font-display text-[15px] font-black text-[#05050a] border-b-2 border-black/10 pb-1 hover:border-black transition-all"
                            >
                                Explorer Hardware ↓
                            </a>
                        </motion.div>

                        {/* Micro-stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="mt-12 flex flex-wrap gap-4"
                        >
                            {["Real-time Vitals", "AI Record Parsing", "Fall Detection"].map((s) => (
                                <span
                                    key={s}
                                    className="font-mono-dm text-[9px] uppercase tracking-widest font-black px-4 py-2 rounded-full border border-black/5 bg-white/50"
                                    style={{ color: "var(--dim)" }}
                                >
                                    {s}
                                </span>
                            ))}
                        </motion.div>
                    </div>


                    {/* Right — Mockup (2/5) */}
                    <div className="lg:col-span-2 flex items-center">
                        <HeroMockup />
                    </div>
                </div>
            </div>
        </section>
    );
}
