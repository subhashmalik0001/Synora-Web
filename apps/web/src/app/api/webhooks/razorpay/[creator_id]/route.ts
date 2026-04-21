import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@paygate/db";
import {
    creators,
    memberships,
    payments,
    products,
} from "@paygate/db/schema";
import { getMembershipQueue, JOB_NAMES } from "@paygate/queue";

export async function POST(
    request: NextRequest,
    { params }: { params: { creator_id: string } }
) {
    const creatorId = params.creator_id;
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    try {
        // 1. Get creator's secret to validate HMAC
        const creator = await (db as any).query.creators.findFirst({
            where: eq(creators.id, creatorId),
            with: { user: true }
        });

        if (!creator || !creator.user?.razorpayWebhookSecret) {
            console.error(`Webhook secret not configured for creator ${creatorId}`);
            return NextResponse.json({ error: "Not configured" }, { status: 400 });
        }

        // 2. Validate Signature
        const expectedSignature = crypto
            .createHmac("sha256", creator.user.razorpayWebhookSecret)
            .update(body)
            .digest("hex");

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);
        const payload = event.payload;

        console.log(`[Webhook] Received ${event.event} for creator ${creatorId}`);

        switch (event.event) {
            case "subscription.authenticated":
            case "subscription.active": {
                const rzpSubscription = payload.subscription.entity;
                const rzpSubscriptionId = rzpSubscription.id;

                // Find membership by subscription ID
                const membership = await (db as any).query.memberships.findFirst({
                    where: eq(memberships.razorpaySubscriptionId, rzpSubscriptionId),
                });

                if (membership) {
                    await db.update(memberships)
                        .set({
                            status: "active",
                            currentPeriodEnd: new Date(rzpSubscription.current_end * 1000),
                            updatedAt: new Date(),
                        })
                        .where(eq(memberships.id, membership.id));

                    // Trigger Telegram Join
                    const product = await (db as any).query.products.findFirst({
                        where: eq(products.id, membership.productId),
                        with: { community: true }
                    });

                    if (product?.community?.platformGroupId) {
                        try {
                            const queue = getMembershipQueue();
                            await queue.add(JOB_NAMES.ADD_MEMBER, {
                                membershipId: membership.id,
                                chatId: product.community.platformGroupId,
                            });
                        } catch (e) {
                            console.error("Queue error:", e);
                        }
                    }
                }
                break;
            }

            case "payment.captured": {
                const rzpPayment = payload.payment.entity;
                const rzpSubscriptionId = rzpPayment.subscription_id;

                if (rzpSubscriptionId) {
                    const membership = await (db as any).query.memberships.findFirst({
                        where: eq(memberships.razorpaySubscriptionId, rzpSubscriptionId),
                        with: { subscription: true }
                    });

                    if (membership) {
                        // Log payment in payments table
                        await db.insert(payments).values({
                            subscriptionId: membership.id,
                            amount: rzpPayment.amount,
                            currency: rzpPayment.currency || "INR",
                            gateway: "razorpay",
                            gatewayPaymentId: rzpPayment.id,
                            gatewayOrderId: rzpPayment.order_id,
                            status: "captured",
                            paidAt: new Date(rzpPayment.created_at * 1000),
                            metadata: JSON.stringify({
                                method: rzpPayment.method,
                                email: rzpPayment.email,
                                contact: rzpPayment.contact
                            })
                        }).onConflictDoUpdate({
                            target: payments.gatewayPaymentId,
                            set: { status: "captured", updatedAt: new Date() }
                        });
                    }
                }
                break;
            }

            case "subscription.cancelled":
            case "subscription.halted": {
                const rzpSubscription = payload.subscription.entity;
                const membership = await (db as any).query.memberships.findFirst({
                    where: eq(memberships.razorpaySubscriptionId, rzpSubscription.id),
                });

                if (membership) {
                    await db.update(memberships)
                        .set({
                            status: event.event === "subscription.cancelled" ? "cancelled" : "payment_failed",
                            updatedAt: new Date(),
                        })
                        .where(eq(memberships.id, membership.id));
                }
                break;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook Internal Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
