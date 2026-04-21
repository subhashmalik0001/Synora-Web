"use client";

import { motion } from "framer-motion";

const steps = [
    {
        num: "01",
        title: "Connect Synora",
        body: "Secure the ESP32-powered wearable to the patient's wrist. It begins transmitting clinical-grade heart rate, SpO2, and motion data within seconds.",
        icon: (
            <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-[#b8ff00] animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-black/10 scale-125" />
            </div>
        ),
    },
    {
        num: "02",
        title: "Set Thresholds",
        body: "Configure custom safety ranges for vitals and fall detection. Synora's neural engine monitors constantly and alerts doctors instantly if values deviate.",
        icon: (
            <div className="relative w-12 h-12 flex items-center justify-center font-display font-black text-xl text-[#05050a]">
                📈<span className="absolute top-0 right-0 text-[10px] text-[#b8ff00]">✚</span>
            </div>
        ),
    },
    {
        num: "03",
        title: "Share EHR Access",
        body: "Generate a secure access link for doctors. Our AI scanner digitizes paper prescriptions and reports, creating a unified health vault ready for review.",
        icon: (
            <div className="relative w-12 h-12 flex items-center justify-center font-display text-2xl text-[#b8ff00]">
                🔗<span className="absolute -top-1 -right-1 text-[10px] text-[#05050a]">📄</span>
            </div>
        ),
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24" style={{ background: 'var(--paper)' }}>
            <div className="mx-auto max-w-7xl px-6">
                {/* Label */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="font-mono-dm text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-[#8a8a8a]"
                >
                    [ THE PROTOCOL ]
                </motion.div>

                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="font-display font-black mb-16 text-[#05050a]"
                    style={{ fontSize: "var(--fs-lg)" }}
                >
                    Three steps. Then technology handles the monitoring.
                </motion.h2>

                {/* Steps */}
                <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
                    {/* Connecting line (desktop) */}
                    <div className="hidden lg:block absolute top-8 left-[16.6%] right-[16.6%] h-px bg-black/5" />
                    {/* Connecting line (mobile) */}
                    <div className="block lg:hidden absolute top-0 bottom-0 left-6 w-px bg-black/5" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.num}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: i * 0.15, duration: 0.5 }}
                            className="relative pl-16 lg:pl-0"
                        >
                            {/* Step number circle */}
                            <div
                                className="absolute lg:relative left-0 lg:left-auto flex h-12 w-12 items-center justify-center font-display font-black text-sm z-10 rounded-2xl bg-[#05050a] text-[#b8ff00]"
                            >
                                {step.num}
                            </div>

                            <div className="mt-0 lg:mt-8">
                                {/* Icon */}
                                <div className="mb-6">{step.icon}</div>
                                <h3 className="font-display font-black text-xl mb-4 text-[#05050a]">
                                    {step.title}
                                </h3>
                                <p className="font-body text-[13px] leading-relaxed text-[#1a1a2e]">
                                    {step.body}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom statement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-24 text-center"
                >
                    <p className="font-serif-accent text-2xl lg:text-3xl leading-relaxed text-[#05050a] italic">
                        Where technology restores dignity.
                        <br />
                        <span className="text-[#4c6ef5]">Synora handles the oversight.</span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
