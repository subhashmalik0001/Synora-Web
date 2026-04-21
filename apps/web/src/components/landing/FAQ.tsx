"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const faqs = [
    {
        q: "What vitals does the Synora wearable monitor?",
        a: "The Synora device provides clinical-grade tracking for Heart Rate (BPM), Blood Oxygen (SpO2), Body Temperature, and real-time motion/fall detection using integrated MAX30102 and MPU6050 sensors."
    },
    {
        q: "How accurate is the AI Record Scanner?",
        a: "Powered by Qwen3-VL, our AI scanner achieves 85%+ accuracy in extracting medical data from paper prescriptions and lab reports. It distinguishes between medications, dosages, and diagnostic biomarkers automatically."
    },
    {
        q: "Is my health data secure and private?",
        a: "Absolutely. Synora is built on a HIPAA-compliant architecture. All data is encrypted at rest and in transit. Access to your EHR vault is strictly controlled via secure, time-limited tokens that you generate for your doctors."
    },
    {
        q: "Can multiple doctors view my live telemetry?",
        a: "Yes. You can generate multiple secure access portals. As a patient, you have full control over who can see your live vitals and who has permission to view your historical records."
    },
    {
        q: "Do I need a continuous internet connection?",
        a: "The Synora wearable syncs via local gateway (smartphone or IoT hub). It stores up to 24 hours of vitals locally if the connection is lost, and auto-syncs the moment it reconnects."
    },
    {
        q: "What constitutes a 'Critical Alert'?",
        a: "You can define custom safe ranges. For instance, if heart rate exceeds 120 or falls below 40, or if the MPU6050 detects a high-impact fall, a priority alert is pushed to all linked emergency contacts instantly."
    }
];

function FAQItem({ q, a }: { q: string, a: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-black/5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-8 flex items-center justify-between text-left group"
            >
                <span className="font-display font-black text-lg lg:text-2xl text-[#05050a] group-hover:text-[#4c6ef5] transition-colors">
                    {q}
                </span>
                <span className={`text-2xl transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} style={{ color: "#05050a" }}>
                    +
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="pb-10 font-body text-sm text-[#1a1a2e] leading-relaxed font-medium max-w-2xl">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQ() {
    return (
        <section id="faq" className="py-24" style={{ background: 'var(--paper)' }}>
            <div className="mx-auto max-w-4xl px-6">
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="font-display font-black text-4xl lg:text-6xl mb-16 text-[#05050a] text-center"
                >
                    Informed. Empowered.
                </motion.h2>
                <div className="border-t border-black/5">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} q={faq.q} a={faq.a} />
                    ))}
                </div>
            </div>
        </section>
    );
}

