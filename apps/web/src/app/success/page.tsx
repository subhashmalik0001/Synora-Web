"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, ExternalLink, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function SuccessContent() {
    const searchParams = useSearchParams();
    const membershipId = searchParams.get("membership");
    const [status, setStatus] = useState<"polling" | "active" | "pending" | "error">("polling");
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [telegramLinked, setTelegramLinked] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (!membershipId) {
            setStatus("error");
            return;
        }

        let pollCount = 0;
        const maxPolls = 20; // ~60 seconds

        const poll = async () => {
            try {
                const res = await fetch(`/api/checkout/status/${membershipId}`);
                const data = await res.json();

                if (data.status === "active") {
                    setStatus("active");
                    setInviteLink(data.inviteLink);
                    setTelegramLinked(data.telegramLinked);
                } else if (pollCount < maxPolls) {
                    pollCount++;
                    setStatus("pending");
                    setTimeout(poll, 3000);
                } else {
                    // Timed out — show active anyway since payment was confirmed client-side
                    setStatus("active");
                    setInviteLink(data.inviteLink);
                    setTelegramLinked(data.telegramLinked);
                }
            } catch {
                if (pollCount < 3) {
                    pollCount++;
                    setTimeout(poll, 3000);
                } else {
                    setStatus("error");
                }
            }
        };

        poll();
    }, [membershipId]);

    const handleVerify = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/memberships/generate-verify-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ membershipId }),
            });
            const data = await res.json();
            if (data.verifyUrl) {
                window.open(data.verifyUrl, "_blank");
            }
        } catch (error) {
            console.error("Failed to generate link:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <Card className="border-0 shadow-2xl">
                    <CardContent className="p-8 text-center space-y-6">
                        {status === "polling" && (
                            <>
                                <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-600" />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Processing your payment...</h1>
                                    <p className="mt-2 text-sm text-gray-500">This usually takes a few seconds</p>
                                </div>
                            </>
                        )}

                        {status === "pending" && (
                            <>
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                                    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Payment received!</h1>
                                    <p className="mt-2 text-sm text-gray-500">
                                        We&apos;re setting up your access. This may take a moment...
                                    </p>
                                </div>
                            </>
                        )}

                        {status === "active" && (
                            <>
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">🎉 Welcome aboard!</h1>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Your payment was successful and your access is now active.
                                    </p>
                                </div>

                                {!telegramLinked && (
                                    <div className="space-y-4 text-left border rounded-xl p-5 bg-blue-50/50">
                                        <h3 className="font-semibold text-gray-900">Step 2: Connect Telegram</h3>
                                        <p className="text-sm text-gray-600">
                                            Click below to verify your Telegram account with Fluxar Bot. This links your subscription so the bot knows who you are.
                                        </p>
                                        <Button
                                            onClick={handleVerify}
                                            disabled={isGenerating}
                                            className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                                            Verify Telegram Account
                                        </Button>
                                    </div>
                                )}

                                {telegramLinked && inviteLink && (
                                    <a
                                        href={inviteLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block"
                                    >
                                        <Button className="w-full h-14 gap-3 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg">
                                            <MessageCircle className="h-5 w-5" />
                                            Open Group in Telegram
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </a>
                                )}

                                {telegramLinked && !inviteLink && (
                                    <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700 border border-blue-200">
                                        <p className="font-medium">Your invite link is being generated</p>
                                        <p className="mt-1 text-xs">Check your email or come back in a few minutes</p>
                                    </div>
                                )}
                            </>
                        )}

                        {status === "error" && (
                            <>
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                    <span className="text-2xl">❌</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Please contact support if you were charged.
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        Powered by <span className="font-semibold text-brand-600">Fluxar</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
