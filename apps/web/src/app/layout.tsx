import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Fluxar – Monetize Your Communities",
    description:
        "Accept UPI, cards & international payments. Automate member access for Telegram, Discord & WhatsApp. Built for Indian creators.",
    keywords: ["fluxar", "paid telegram group", "membership management", "creator monetization", "india payments"],
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
