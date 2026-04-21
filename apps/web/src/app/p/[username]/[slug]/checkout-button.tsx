"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CheckoutButtonProps {
    productId: string;
    creatorSlug: string;
    productSlug: string;
    price: string;
    billingInterval: string;
    razorpayKeyId?: string;
}

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => {
            open: () => void;
            on: (event: string, callback: () => void) => void;
        };
    }
}

export function CheckoutButton({
    productId,
    price,
    billingInterval,
    razorpayKeyId,
}: CheckoutButtonProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim() || !email.trim() || !phone.trim()) {
            setError("All fields are required");
            return;
        }
        if (phone.replace(/\D/g, "").length !== 10) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/checkout/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.replace(/\D/g, ""),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error?.message || "Failed to initiate checkout");
                setLoading(false);
                return;
            }

            if (!razorpayKeyId) {
                setError("Payment gateway not configured. Please contact the creator.");
                setLoading(false);
                return;
            }

            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error("Failed to load Razorpay"));
                    document.body.appendChild(script);
                });
            }

            // Open Razorpay checkout
            const options = {
                key: razorpayKeyId,
                subscription_id: data.razorpaySubscriptionId,
                name: data.creatorBrandName || "Fluxar",
                description: data.productName,
                prefill: {
                    name: name.trim(),
                    email: email.trim(),
                    contact: phone.replace(/\D/g, ""),
                },
                theme: { color: "#6366f1" },
                handler: async (response: { razorpay_payment_id?: string; razorpay_subscription_id?: string; razorpay_signature?: string }) => {
                    // Verify payment and activate membership
                    try {
                        await fetch("/api/checkout/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                membershipId: data.membershipId,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySubscriptionId: response.razorpay_subscription_id,
                                razorpaySignature: response.razorpay_signature,
                            }),
                        });
                    } catch {
                        // Even if verify fails, redirect — the webhook will catch it
                    }
                    window.location.href = `/success?membership=${data.membershipId}`;
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleCheckout} className="space-y-4">
            <Input
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <Input
                label="Phone (WhatsApp)"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                required
            />

            {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-lg shadow-brand-600/20"
                disabled={loading}
            >
                {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                {loading
                    ? "Processing..."
                    : `Subscribe for ${price}${billingInterval !== "one_time" && billingInterval !== "lifetime" ? `/${billingInterval === "monthly" ? "mo" : billingInterval === "quarterly" ? "qtr" : "yr"}` : ""}`}
            </Button>
        </form>
    );
}
