"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Pricing() {
    return (
        <section id="pricing" className="py-24" style={{ background: 'var(--paper)' }}>
            <div className="mx-auto max-w-7xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 space-y-4"
                >
                    <h2 className="font-display font-black text-4xl lg:text-5xl text-[#05050a]">
                        Transparency in Care.
                    </h2>
                    <p className="font-mono-dm text-[#8a8a8a] text-[10px] uppercase tracking-[0.2em] font-black">
                        No hidden setup fees. No medical bureaucracy.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* FREE CARD */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white border border-black/5 p-10 flex flex-col rounded-[32px] premium-shadow"
                    >
                        <div className="text-[10px] font-black tracking-[0.2em] text-[#8a8a8a] mb-10 uppercase">[ FREE FOREVER ]</div>
                        <div className="font-display font-black text-6xl mb-2 text-[#05050a]">₹0</div>
                        <div className="text-[#8a8a8a] font-mono-dm text-sm mb-10">/ month</div>

                        <ul className="space-y-5 flex-1 mb-10">
                            {["Standard Vitals Monitoring", "AI Prescription (5 scans/mo)", "Single Patient Profile", "Standard Email Support", "Basic Health Analytics", "Encrypted Data Vault"].map(f => (
                                <li key={f} className="flex items-start gap-4 font-body text-[13px] text-[#1a1a2e] font-medium">
                                    <span className="text-[#b8ff00] font-black">✚</span> {f}
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/signup"
                            className="w-full py-5 rounded-2xl border-2 border-[#05050a] text-[#05050a] font-display font-black text-center hover:bg-[#05050a] hover:text-[#b8ff00] transition-all"
                        >
                            Start Free →
                        </Link>
                    </motion.div>

                    {/* PRO CARD */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#05050a] p-10 flex flex-col relative rounded-[32px] premium-shadow"
                    >
                        <div className="absolute top-6 right-10 bg-[#b8ff00] text-[#05050a] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                            Most Popular
                        </div>
                        <div className="text-[10px] font-black tracking-[0.2em] text-[#b8ff00] mb-10 uppercase">[ PRO ]</div>
                        <div className="font-display font-black text-6xl mb-2 text-white">₹999</div>
                        <div className="text-white/40 font-mono-dm text-sm mb-10">/ month</div>

                        <ul className="space-y-5 flex-1 mb-10">
                            {["Unlimited Real-time Monitoring", "Unlimited AI OCR Scans", "Advanced Health Trends", "Priority Doctor Triage", "Custom Fall Detect Sensitivity", "HIPAA Audit Logging", "Bulk EHR Deployment"].map(f => (
                                <li key={f} className="flex items-start gap-4 font-body text-[13px] text-white/80 font-medium">
                                    <span className="text-[#b8ff00] font-black">✚</span> {f}
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/signup"
                            className="w-full py-5 bg-[#b8ff00] text-[#05050a] rounded-2xl font-display font-black text-center hover:scale-[1.02] transition-transform"
                        >
                            Elevate Care →
                        </Link>
                    </motion.div>
                </div>

                <div className="mt-24 max-w-3xl mx-auto p-12 bg-white border border-black/5 rounded-[40px] text-center">
                    <div className="text-[10px] text-[#8a8a8a] mb-6 font-black uppercase tracking-[0.2em] italic">Where precision meets empathy.</div>
                    <p className="font-serif-accent text-3xl text-[#05050a] leading-relaxed italic">
                        The gold standard in 
                        <br />
                        <span className="text-[#4c6ef5] underline decoration-[#b8ff00] decoration-2">Modern Assistive Tech.</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
