import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm transition-all duration-200",
                            "placeholder:text-gray-400",
                            "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "dark:border-gray-700 dark:bg-gray-900 dark:text-white",
                            icon && "pl-10",
                            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
