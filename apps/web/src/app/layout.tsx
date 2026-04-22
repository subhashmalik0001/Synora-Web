import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Synora – AI-Powered Medical Intelligence",
    description:
        "Clinical-grade remote patient monitoring, smart EHR systems, and AI-driven medical record analysis. Built for modern healthcare.",
    keywords: ["synora", "medical ai", "remote patient monitoring", "smart ehr", "telemedicine india"],
    icons: {
        icon: "/logo.png",
        apple: "/logo.png",
    },
};

import { TRPCProvider } from "@/components/providers/trpc-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-white antialiased">
                <TRPCProvider>
                    {children}
                </TRPCProvider>
            </body>
        </html>
    );
}
