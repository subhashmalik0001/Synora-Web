"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const ringX = useSpring(cursorX, { stiffness: 300, damping: 28 });
    const ringY = useSpring(cursorY, { stiffness: 300, damping: 28 });
    const ringSize = useMotionValue(36);
    const dotSize = useMotionValue(10);
    const ringSpring = useSpring(ringSize, { stiffness: 400, damping: 30 });
    const dotSpring = useSpring(dotSize, { stiffness: 400, damping: 30 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isTouch = window.matchMedia("(pointer: coarse)").matches;
        if (isTouch) return;

        const move = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest("a, button, [role=button], input, textarea, select, [data-interactive]")) {
                ringSize.set(56);
                dotSize.set(20);
            }
        };

        const handleOut = () => {
            ringSize.set(36);
            dotSize.set(10);
        };

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseover", handleOver);
        window.addEventListener("mouseout", handleOut);
        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseover", handleOver);
            window.removeEventListener("mouseout", handleOut);
        };
    }, [cursorX, cursorY, ringSize, dotSize]);

    return (
        <div ref={containerRef} className="custom-cursor">
            {/* Dot */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-[10000] rounded-full"
                style={{
                    x: cursorX,
                    y: cursorY,
                    width: dotSpring,
                    height: dotSpring,
                    backgroundColor: "var(--gold)",
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
            {/* Ring */}
            <motion.div
                className="custom-cursor-ring pointer-events-none fixed top-0 left-0 z-[9999] rounded-full"
                style={{
                    x: ringX,
                    y: ringY,
                    width: ringSpring,
                    height: ringSpring,
                    border: "1px solid var(--gold)",
                    opacity: 0.5,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
        </div>
    );
}
