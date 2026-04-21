"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
    target: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
    className?: string;
    separator?: boolean;
}

export default function AnimatedCounter({
    target,
    prefix = "",
    suffix = "",
    duration = 1500,
    className = "",
    separator = true,
}: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const startTime = performance.now();
                    const animate = (now: number) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.round(eased * target));
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);

    const formatted = separator
        ? count.toLocaleString("en-IN")
        : count.toString();

    return (
        <span ref={ref} className={className}>
            {prefix}{formatted}{suffix}
        </span>
    );
}
