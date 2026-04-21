"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import AnimatedCounter from "./AnimatedCounter";

const terminalLines = [
    "$ checking_payment_status.sh",
    "",
    "[14:32] Checking WhatsApp...",
    "[14:33] Screenshot received from Priya",
    '[14:33] Amount: ₹999 (unverified)',
    "[14:34] Manually adding to group...",
    "[14:35] Added. Praying she doesn't screenshot and share",
    "[14:36] Reminder: Rahul hasn't paid yet",
    "[14:36] Rahul hasn't paid in 3 weeks",
    '[14:37] WhatsApp: "bhai 2 din aur"',
    "[14:38] ...",
    "[14:39] ...",
    "[14:40] ERROR: human_time wasted: 4.3 hours/week",
    "[14:41] ERROR: payment_leak_detected: ₹12,400/month",
    "[14:42] FATAL: you_are_the_software",
];

const painPoints = [
    "Manual UPI verification for every single payment",
    "Non-payers staying in your group for weeks",
    "Screenshot scammers sharing fake payment proofs",
    "Wasting 4+ hours every week on admin work",
    "No idea who's due for renewal and when",
    "Members ghosting after you've added them",
];

function TerminalWindow() {
    const [visibleLines, setVisibleLines] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasStarted = useRef(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted.current) {
                    hasStarted.current = true;
                    let i = 0;
                    const id = setInterval(() => {
                        i++;
                        setVisibleLines(i);
                        if (i >= terminalLines.length) clearInterval(id);
                    }, 250);
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="p-5 font-mono-dm text-xs leading-relaxed overflow-hidden"
            style={{
                background: "#0a0a0a",
                border: "1px solid #1a1a1a",
                color: "#00ff00",
                maxHeight: 400,
            }}
        >
            {terminalLines.slice(0, visibleLines).map((line, i) => (
                <div key={i} className={`${line.includes("ERROR") ? "text-red-400" : line.includes("FATAL") ? "text-red-500 font-bold" : ""}`}>
                    {line}
                </div>
            ))}
            {visibleLines < terminalLines.length && <span className="terminal-cursor" />}
        </div>
    );
}

export default function Problem() {
    return (
        <section className="section-dark py-24" style={{ background: 'var(--paper)' }}>
            <div className="mx-auto max-w-7xl px-6">
                {/* Headline */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="font-display font-black" style={{ fontSize: "var(--fs-lg)", color: "var(--ink)" }}>
                        Current healthcare
                        <br />
                        is <span className="font-serif-accent italic" style={{ color: "var(--electric)" }}>dangerously</span>
                        <br />
                        fragmented.
                    </h2>
                </motion.div>

                {/* Two-column */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Left — Terminal */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="font-mono-dm text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: "var(--dim)" }}>
                            THE OLD WAY
                        </div>
                        <TerminalWindow />
                    </motion.div>

                    {/* Right — Pain Points */}
                    <div className="flex flex-col justify-center">
                        <div className="space-y-4">
                            {painPoints.map((point, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: i * 0.1, duration: 0.4 }}
                                    className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-black/5 premium-shadow"
                                >
                                    <span className="text-red-500 mt-0.5 text-lg leading-none font-bold">✗</span>
                                    <span className="font-body text-sm font-medium" style={{ color: "var(--ink)" }}>
                                        {point}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom stat bar */}
                <motion.div
                    className="mt-20 grid grid-cols-1 gap-px md:grid-cols-3 rounded-[32px] overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    style={{ background: "var(--line)" }}
                >
                    {[
                        { num: 150000000, prefix: "", suffix: "+", label: "elderly population", sub: "lacking continuous monitoring" },
                        { num: 4.8, prefix: "", suffix: " Hours", label: "wasted weekly", sub: "retrieving medical records" },
                        { num: 67, prefix: "", suffix: "%", label: "records lost", sub: "without a digital EHR portal" },
                    ].map((stat, i) => (
                        <div key={i} className="p-12 text-center bg-white">
                            <div className="text-4xl font-display font-black" style={{ color: "var(--ink)" }}>
                                {stat.num >= 1000000 ? (
                                    <AnimatedCounter target={stat.num / 1000000} prefix={stat.prefix} suffix={"M" + stat.suffix} separator={false} />
                                ) : (
                                    <AnimatedCounter target={stat.num} prefix={stat.prefix} suffix={stat.suffix} separator={false} />
                                )}
                            </div>
                            <div className="mt-3 font-mono-dm text-[10px] font-black uppercase tracking-widest" style={{ color: "#05050a" }}>{stat.label}</div>
                            <div className="mt-1 font-body text-xs text-[#8a8a8a]">{stat.sub}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
