"use client";

import { motion } from "framer-motion";

import AnimatedCounter from "./AnimatedCounter";

const testimonials = [
    {
        quote: "I was spending hours manually checking on my parents' vitals. Synora's real-time dashboard and fall detection gave me peace of mind.",
        name: "Rohit Sharma",
        category: "Caregiver • Mumbai",
        impact: "24/7 Peace of Mind",
    },
    {
        quote: "Synora's AI scanner reduced our record entry time by 80%. We can now focus on patient care instead of clerical data entry.",
        name: "Dr. Kavita Nair",
        category: "Fortis Healthcare • Bangalore",
        impact: "80% Time Saved",
    },
    {
        quote: "The low-latency vital sync is impressive. I can see my patient's heart rate trends in real-time even from another city.",
        name: "Dr. Arjun Mehta",
        category: "Cardiologist • Delhi",
        impact: "Live Clinical Data",
    },
    {
        quote: "Finally a system that bridges the gap between IoT hardware and professional EHR. It's simple, secure, and reliable.",
        name: "Priya Venkatesh",
        category: "Geriatric Specialist • Chennai",
        impact: "98% Accuracy",
    },
];

export default function SocialProof() {
    return (
        <section id="health-outcomes" className="py-24" style={{ background: 'var(--paper)' }}>
            <div className="mx-auto max-w-7xl px-6">
                {/* Live stats bar */}
                <motion.div
                    className="grid grid-cols-2 gap-px md:grid-cols-4 mb-20 rounded-[32px] overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    style={{ background: "var(--line)" }}
                >
                    {[
                        { num: 1.2, suffix: "M", prefix: "", label: "vitals synced", sub: "through Synora" },
                        { num: 24000, suffix: "+", prefix: "", label: "alerts prevented", sub: "emergencies mitigated" },
                        { num: 98, suffix: "%", prefix: "", label: "detection accuracy", sub: "fall & vitals" },
                        { num: 2, suffix: " sec", prefix: "< ", label: "avg latency", sub: "IoT to Cloud" },
                    ].map((stat, i) => (
                        <div key={i} className="p-8 lg:p-10 text-center bg-white">
                            <div className="text-3xl lg:text-4xl font-display font-black text-[#05050a]">
                                <AnimatedCounter target={stat.num} prefix={stat.prefix} suffix={stat.suffix} separator={stat.num >= 1000} />
                            </div>
                            <div className="mt-3 font-mono-dm text-[10px] uppercase tracking-[0.2em] font-black text-[#8a8a8a]">{stat.label}</div>
                            <div className="mt-1 font-body text-xs text-[#b0b0b0] font-medium">{stat.sub}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="font-display font-black text-center mb-16 text-[#05050a]"
                    style={{ fontSize: "var(--fs-lg)" }}
                >
                    Trust from the frontline of care.
                </motion.h2>

                {/* Testimonial cards — 2x2 */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: i * 0.1, duration: 0.4 }}
                            className="relative p-10 overflow-hidden rounded-[32px] bg-white border border-black/5 premium-shadow"
                        >
                            {/* Background decorative quote */}
                            <div
                                className="absolute -top-10 -left-4 font-serif-accent text-[240px] leading-none pointer-events-none select-none italic"
                                style={{ color: "#4c6ef5", opacity: 0.03 }}
                                aria-hidden="true"
                            >
                                &ldquo;
                            </div>

                            <p className="relative font-body text-[15px] leading-relaxed mb-8 text-[#1a1a2e] font-medium italic">
                                &ldquo;{t.quote}&rdquo;
                            </p>

                            <div className="relative flex items-center justify-between">
                                <div>
                                    <div className="font-display font-black text-sm text-[#05050a]">{t.name}</div>
                                    <div className="font-mono-dm text-[10px] font-black uppercase tracking-widest mt-1 text-[#8a8a8a]">{t.category}</div>
                                </div>
                                <div
                                    className="font-mono-dm text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-[#b8ff00]/10 text-[#05050a] rounded-xl border border-[#b8ff00]/20"
                                >
                                    {t.impact}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
