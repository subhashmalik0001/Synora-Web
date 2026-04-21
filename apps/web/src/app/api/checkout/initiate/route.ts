import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@paygate/db";
import { creators, products, users, memberships } from "@paygate/db/schema";
import { decrypt } from "@paygate/shared";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, name, email, phone } = body;

        if (!productId || !name || !email || !phone) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "All fields are required" } },
                { status: 400 }
            );
        }

        // Get product and creator
        const product = await (db as any).query.products.findFirst({
            where: and(eq(products.id, productId), eq(products.status, "active")),
        });

        if (!product) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Product not found" } },
                { status: 404 }
            );
        }

        const creator = await (db as any).query.creators.findFirst({
            where: eq(creators.id, product.creatorId),
        });
        if (!creator) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Creator not found" } },
                { status: 404 }
            );
        }

        // Get creator's Razorpay keys
        const creatorUser = await (db as any).query.users.findFirst({
            where: eq(users.id, creator.userId),
        });
        if (!creatorUser?.razorpayKeyId || !creatorUser?.razorpayKeySecretEncrypted) {
            return NextResponse.json(
                { success: false, error: { code: "GATEWAY_NOT_CONFIGURED", message: "Payment gateway not configured" } },
                { status: 400 }
            );
        }

        const keySecret = decrypt(creatorUser.razorpayKeySecretEncrypted);
        const authHeader = Buffer.from(`${creatorUser.razorpayKeyId}:${keySecret}`).toString("base64");

        let razorpaySubscriptionId: string | null = null;

        if (product.billingInterval !== "one_time" && product.billingInterval !== "lifetime") {
            // For recurring: create a Razorpay plan (if not exists) then subscription
            let planId = product.razorpayPlanId;

            if (!planId) {
                // Create plan
                const planRes = await fetch("https://api.razorpay.com/v1/plans", {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${authHeader}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        period: product.billingInterval === "monthly" ? "monthly" : product.billingInterval === "quarterly" ? "monthly" : "monthly",
                        interval: product.billingInterval === "monthly" ? 1 : product.billingInterval === "quarterly" ? 3 : 12,
                        item: {
                            name: product.name,
                            amount: product.pricePaise,
                            currency: product.currency || "INR",
                        },
                    }),
                });

                if (!planRes.ok) {
                    const planErr = await planRes.json();
                    return NextResponse.json(
                        { success: false, error: { code: "RAZORPAY_ERROR", message: planErr?.error?.description || "Failed to create plan" } },
                        { status: 500 }
                    );
                }

                const plan = await planRes.json();
                planId = plan.id;

                // Save plan ID to product
                await db.update(products).set({ razorpayPlanId: planId }).where(eq(products.id, product.id));
            }

            // Create subscription
            const subRes = await fetch("https://api.razorpay.com/v1/subscriptions", {
                method: "POST",
                headers: {
                    Authorization: `Basic ${authHeader}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plan_id: planId,
                    total_count: 120, // 10 years of monthly payments
                    quantity: 1,
                    customer_notify: 1,
                    notes: {
                        productId: product.id,
                        creatorId: creator.id,
                        buyerEmail: email,
                        buyerName: name,
                    },
                }),
            });

            if (!subRes.ok) {
                const subErr = await subRes.json();
                return NextResponse.json(
                    { success: false, error: { code: "RAZORPAY_ERROR", message: subErr?.error?.description || "Failed to create subscription" } },
                    { status: 500 }
                );
            }

            const subscription = await subRes.json();
            razorpaySubscriptionId = subscription.id;
        }

        // Create membership record
        const [membership] = await db
            .insert(memberships)
            .values({
                productId: product.id,
                communityId: product.communityId || null,
                buyerEmail: email,
                buyerPhone: phone,
                buyerName: name,
                razorpaySubscriptionId,
                status: "pending",
                platform: "telegram",
            })
            .returning();

        return NextResponse.json({
            success: true,
            membershipId: membership.id,
            razorpaySubscriptionId,
            productName: product.name,
            creatorBrandName: creator.brandName,
        });
    } catch (error) {
        console.error("Checkout initiate error:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
            { status: 500 }
        );
    }
}
