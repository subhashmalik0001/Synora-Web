"use client";

import { motion } from "framer-motion";

const features = [
    {
        headline: "Continuous Vital Oversight. Zero Emergency Delay.",
        body: "Synora's hardware engine monitors heart rate, SpO2, and temperature every 30 seconds. Integrated fall detection triggers instant SOS alerts to doctors and caregivers the moment a threshold is breached. Proactive care, automated.",
        tags: ["IOT INTEGRATED", "REAL-TIME", "CLINICAL"],
        visual: <FeatureOneVisual />
    },
    {
        headline: "AI Clinical OCR. Paper records, digitized in seconds.",
        body: "Our proprietary integration with Qwen3-VL allows patients to scan any paper prescription or lab report. The AI extracts medicines, dosages, and biomarkers with 85%+ accuracy, auto-organizing them into a structured digital vault.",
        tags: ["AI POWERED", "SMART SCAN", "EHR READY"],
        visual: <FeatureTwoVisual />
    },
    {
        headline: "A Unified Dashboard for the Modern Doctor.",
        body: "Doctors get a live, tile-based overview of all assigned patients. Drill down into trend charts for Blood Pressure, Glucose, and Vitals. Approve access requests with one click and collaborate on treatment plans in real-time.",
        tags: ["DOCTOR READY", "ANALYTICS", "SECURE"],
        visual: <FeatureThreeVisual />
    }
];

function FeatureOneVisual() {
    return (
        <div className="relative h-64 w-full bg-white border border-black/5 premium-shadow overflow-hidden flex flex-col justify-center p-8 font-mono-dm space-y-4 rounded-3xl">
            <div className="flex items-center justify-between text-[10px] border-b border-black/5 pb-3">
                <span className="text-red-500 font-bold">! CRITICAL ALERT — Patient #104</span>
                <span className="text-[#8a8a8a]">8s ago</span>
            </div>
            <div className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-[#05050a] flex items-center justify-center text-xs text-[#b8ff00]">✚</div>
                <div className="flex-1 bg-black/5 h-12 rounded-xl p-3 text-[11px] text-[#05050a] font-medium">
                    HR: 118 BPM detected. Notifying Dr. Sinha...
                </div>
            </div>
            <div className="flex flex-col space-y-2">
                <div className="text-[9px] text-[#8a8a8a] font-black uppercase tracking-widest">Protocol Executed</div>
                <div className="bg-[#b8ff00]/10 p-4 text-[11px] text-[#05050a] border-l-4 border-[#05050a] rounded-r-xl">
                    Emergency SMS sent to: <span className="font-bold underline">+91 98XXX XXX01</span>
                </div>
            </div>
        </div>
    );
}

function FeatureTwoVisual() {
    const dataPoints = ["PARSING...", "MEDICINES", "DOSAGE", "RESULTS", "DATE", "HOSPITAL", "DR. NAME", "CONFIRMED"];
    return (
        <div className="grid grid-cols-4 gap-4 p-8 bg-white border border-black/5 premium-shadow rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.03)]">
            {dataPoints.map((point, i) => (
                <motion.div
                    key={point}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.98, 1, 0.98] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.15 }}
                    className="h-14 flex items-center justify-center border border-black/5 rounded-xl text-[9px] font-black tracking-widest text-[#05050a] bg-black/[0.02]"
                >
                    {point}
                </motion.div>
            ))}
        </div>
    );
}

function FeatureThreeVisual() {
    return (
        <div className="p-6 bg-white border border-black/5 premium-shadow font-mono-dm space-y-6 h-64 overflow-hidden rounded-3xl">
            <div className="grid grid-cols-2 gap-4">
                <div className="border border-black/5 p-4 rounded-2xl bg-black/[0.02]">
                    <div className="text-[9px] text-[#8a8a8a] font-black uppercase tracking-widest">Active RPM</div>
                    <div className="text-xl font-black text-[#05050a]">1,428 Cases</div>
                </div>
                <div className="border border-black/5 p-4 rounded-2xl bg-black/[0.02]">
                    <div className="text-[9px] text-[#8a8a8a] font-black uppercase tracking-widest">Alert Delay</div>
                    <div className="text-xl font-black text-red-500">{"< 3.2s"}</div>
                </div>
            </div>
            <div className="border border-black/5 p-4 rounded-2xl flex-1 bg-black/[0.02]">
                <div className="text-[9px] text-[#8a8a8a] font-black uppercase tracking-widest mb-3 text-center">Vitals Synchronicity</div>
                <div className="h-24 w-full flex items-end gap-1.5 px-2">
                    {[40, 70, 45, 95, 60, 100, 85].map((h, i) => (
                        <div key={i} className={`flex-1 rounded-t-lg transition-all ${i === 3 ? 'bg-red-500' : 'bg-[#05050a]'}`} style={{ height: `${h}%`, opacity: 0.8 }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Features() {
    return (
        <section id="monitoring" className="py-24" style={{ background: 'var(--paper)' }}>
            <div className="mx-auto max-w-7xl px-6 space-y-48">
                {features.map((f, i) => (
                    <div key={i} className={`flex flex-col lg:flex-row gap-20 items-center ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                        <motion.div
                            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex-1 space-y-8"
                        >
                            <div className="flex gap-2">
                                {f.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-black tracking-[0.2em] px-3 py-1 bg-[#05050a] text-[#b8ff00] rounded-lg">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h2 className="font-display font-black text-4xl lg:text-5xl leading-[1.1] text-[#05050a]">
                                {f.headline}
                            </h2>
                            <p className="font-body text-[15px] text-[#1a1a2e] leading-relaxed">
                                {f.body}
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex-1 w-full"
                        >
                            {f.visual}
                        </motion.div>
                    </div>
                ))}
            </div>
        </section>
    );
}

