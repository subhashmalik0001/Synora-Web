"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function FinalCTA() {
    return (
        <section className="pb-32 pt-16 relative overflow-hidden" style={{ background: 'var(--paper)' }}>
            {/* Massive Medical watermark */}
            <div
                className="pointer-events-none absolute select-none font-display font-black"
                style={{
                    fontSize: "600px",
                    color: "var(--line)",
                    opacity: 0.1,
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    lineHeight: 1,
                    zIndex: 0
                }}
            >
                ✚
            </div>

            <div className="mx-auto max-w-7xl px-6 relative z-10 text-center flex flex-col items-center">
                <div className="h-px w-full bg-black/5 mb-20" />

                <h2 className="font-display font-black text-5xl lg:text-7xl leading-[1.1] mb-12 text-[#05050a]">
                    {["Restore dignity.", "Restore safety.", "Restore independence.", "Now."].map((line, i) => (
                        <motion.span
                            key={line}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.6 }}
                            className="block"
                        >
                            {line}
                        </motion.span>
                    ))}
                </h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="font-body text-[#1a1a2e] mb-12 text-base lg:text-lg max-w-xl font-medium"
                >
                    Synora is a healthcare ecosystem built for clinical precision and 
                    human empathy. Join 2,400+ families and doctors already using our platform.
                </motion.p>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                    className="w-full flex flex-col items-center"
                >
                    <Link
                        href="/signup"
                        className="cta-primary w-full max-w-[400px] h-[72px] bg-[#05050a] text-[#b8ff00] font-display font-black text-xl lg:text-3xl flex items-center justify-center tracking-tight transition-transform hover:scale-[1.05] rounded-3xl"
                    >
                        Start Your Care Journey →
                    </Link>
                    <div className="mt-10 font-mono-dm text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a] flex flex-wrap justify-center gap-x-8 gap-y-4 font-black">
                        <span>No credit card required</span>
                        <span className="opacity-30">·</span>
                        <span>HIPAA Compliant</span>
                        <span className="opacity-30">·</span>
                        <span>24/7 Monitoring Active</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
