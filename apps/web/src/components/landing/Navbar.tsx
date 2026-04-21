"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";



export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const links = [
        { label: "Remote Monitoring", href: "#monitoring" },
        { label: "Smart EHR", href: "#ehr" },
        { label: "Synora Wearable", href: "#hardware" },
        { label: "Pricing", href: "#pricing" },
    ];

    return (
        <>
            <header className="fixed top-0 z-50 w-full border-b backdrop-blur-md" style={{ borderColor: "rgba(0,0,0,0.04)", background: "rgba(250,250,248,0.85)" }}>
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2 font-display text-xl font-black" style={{ color: "var(--ink)" }}>
                        <span className="h-8 w-8 bg-[#05050a] rounded-lg flex items-center justify-center text-[#b8ff00] text-sm">S</span>
                        SYNORA
                    </Link>


                    <nav className="hidden items-center gap-8 md:flex">
                        {links.map((l) => (
                            <a
                                key={l.label}
                                href={l.href}
                                className="text-[11px] font-black uppercase tracking-widest transition-colors"
                                style={{ color: "var(--dim)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--dim)")}
                            >
                                {l.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="font-display text-[12px] font-black px-4 py-2 text-[var(--ink)] hover:bg-black/5 transition-all"
                        >
                            SIGN IN
                        </Link>
                        <Link
                            href="/signup"
                            className="font-display text-[12px] font-black px-4 py-2 bg-[#05050a] text-[#b8ff00] rounded-xl transition-transform hover:scale-[1.02]"
                        >
                            GET STARTED →
                        </Link>




                        {/* Mobile hamburger */}
                        <button
                            className="flex flex-col gap-1.5 md:hidden"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className="block h-0.5 w-6 transition-all" style={{ background: "var(--ink)", transform: menuOpen ? "rotate(45deg) translateY(4px)" : "none" }} />
                            <span className="block h-0.5 w-6 transition-opacity" style={{ background: "var(--ink)", opacity: menuOpen ? 0 : 1 }} />
                            <span className="block h-0.5 w-6 transition-all" style={{ background: "var(--ink)", transform: menuOpen ? "rotate(-45deg) translateY(-4px)" : "none" }} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 md:hidden"
                        style={{ background: "var(--ink)" }}
                    >
                        {links.map((l) => (
                            <motion.a
                                key={l.label}
                                href={l.href}
                                onClick={() => setMenuOpen(false)}
                                className="font-display text-3xl font-bold"
                                style={{ color: "var(--paper)" }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                {l.label}
                            </motion.a>
                        ))}
                            <Link
                                href="/dashboard"
                                className="font-display text-lg font-bold px-8 py-3 mt-4"
                                style={{ background: "var(--acid)", color: "var(--ink)" }}
                                onClick={() => setMenuOpen(false)}
                            >
                                Explore Platform →
                            </Link>

                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
