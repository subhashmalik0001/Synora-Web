"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import AnimatedCounter from "./AnimatedCounter";

const events = [
    { type: "normal", name: "Patient #882", status: "Vitals Sync", value: "72 BPM", time: "2s ago" },
    { type: "critical", name: "Patient #104", status: "Critical Alert", value: "118 BPM", time: "8s ago" },
    { type: "scan", name: "Arthur D.", status: "OCR Success", value: "Lab Report", time: "14s ago" },
    { type: "normal", name: "Patient #221", status: "Vitals Sync", value: "98% SpO2", time: "22s ago" },
    { type: "appointment", name: "Dr. Sinha", status: "Consultation", value: "Linked", time: "31s ago" },
];

export default function HeroMockup() {
    const [visibleEvents, setVisibleEvents] = useState(events.slice(0, 3));
    const indexRef = useRef(3);

    useEffect(() => {
        const id = setInterval(() => {
            setVisibleEvents((prev) => {
                const next = events[indexRef.current % events.length];
                indexRef.current++;
                return [next, ...prev.slice(0, 2)];
            });
        }, 3000);
        return () => clearInterval(id);
    }, []);

    return (
        <motion.div
            className="relative w-full max-w-md mx-auto lg:mx-0"
            initial={{ opacity: 0, rotateY: -8, rotateX: 2, x: 60 }}
            animate={{ opacity: 1, rotateY: -8, rotateX: 2, x: 0 }}
            transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
            whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
            style={{ perspective: 1000, transformStyle: "preserve-3d" }}
        >
            <div
                className="p-8 rounded-[40px] border border-black/5 premium-shadow bg-white/80 backdrop-blur-2xl"
            >
                {/* Title */}
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <div className="font-display font-black text-[10px] tracking-[0.15em] uppercase text-[#05050a]">
                        Live Monitoring Hub
                    </div>
                </div>
                
                <div className="mt-6 h-px w-full bg-black/5" />

                {/* Stats */}
                <div className="mt-8 grid grid-cols-2 gap-8 text-[#05050a]">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#8a8a8a]">Avg Heart Rate</div>
                        <div className="mt-2 text-3xl font-black flex items-baseline gap-1">
                            <AnimatedCounter target={74} duration={1500} />
                            <span className="text-xs text-[#8a8a8a]">BPM</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#8a8a8a]">Monitor Up-time</div>
                        <div className="mt-2 text-3xl font-black flex items-baseline gap-1">
                            <AnimatedCounter target={99} suffix=".9" duration={1500} />
                            <span className="text-xs text-[#8a8a8a]">%</span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-8 h-px w-full bg-black/5" />

                {/* Events */}
                <div className="text-[10px] font-black uppercase tracking-widest text-[#8a8a8a] mb-5">Neural Activity Feed</div>
                <div className="space-y-4 min-h-[140px]">
                    {visibleEvents.map((ev, i) => (
                        <motion.div
                            key={`${ev.name}-${i}-${indexRef.current}`}
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-4 group"
                        >
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                                ev.type === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-[#b8ff00]/20 text-[#05050a]'
                            }`}>
                                {ev.type === 'critical' ? '!' : '✓'}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-black text-[#05050a]">{ev.name}</span>
                                    <span className="text-[10px] font-bold text-[#b0b0b0]">{ev.time}</span>
                                </div>
                                <div className="text-[11px] font-medium text-[#8a8a8a]">
                                    {ev.status} • <span className="font-bold text-[#05050a]">{ev.value}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Tag */}
                <div className="mt-10 p-3 rounded-2xl bg-[#05050a] text-[#b8ff00] text-[9px] font-black uppercase tracking-[0.2em] text-center">
                    IoT Sync: Active via MQTT v5
                </div>
            </div>
        </motion.div>
    );
}
