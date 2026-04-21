import * as React from "react";

import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & {
        variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
    }
>(({ className, variant = "default", ...props }, ref) => {
    const variants = {
        default: "bg-brand-50 text-brand-700 border-brand-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        danger: "bg-red-50 text-red-700 border-red-200",
        info: "bg-sky-50 text-sky-700 border-sky-200",
        outline: "bg-transparent text-gray-600 border-gray-300",
    };

    return (
        <span
            ref={ref}
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                variants[variant],
                className
            )}
            {...props}
        />
    );
});
Badge.displayName = "Badge";

export { Badge };
