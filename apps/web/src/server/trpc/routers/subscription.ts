import { TRPCError } from "@trpc/server";
import { eq, desc, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { creators, memberships, products, users, payments } from "@paygate/db/schema";
import { JOB_NAMES, type SendEmailPayload } from "@paygate/queue";
import { decrypt } from "@paygate/shared";
import { getMembershipQueue } from "@paygate/queue";

import { notificationsQueue } from "../../queue";
import { router, protectedProcedure } from "../init";

export const subscriptionRouter = router({
    listMembers: protectedProcedure.query(async ({ ctx }) => {
        const creator = await ctx.db.query.creators.findFirst({
            where: eq(creators.userId, ctx.user.id),
        });

        if (!creator) return [];

        // Get all products for this creator
        const creatorProducts = await ctx.db.query.products.findMany({
            where: eq(products.creatorId, creator.id),
        });

        if (creatorProducts.length === 0) return [];

        const productIds = creatorProducts.map((p) => p.id);

        // Query memberships (where checkout data lives)
        const membersList = await ctx.db.query.memberships.findMany({
            where: inArray(memberships.productId, productIds),
            with: {
                product: true,
            },
            orderBy: [desc(memberships.createdAt)],
        });

        return membersList.map((m) => ({
            subscriptionId: m.id, // Keep this key name for UI compatibility
            status: m.status,
            nextRenewal: m.currentPeriodEnd,
            joinDate: m.createdAt,
            productName: m.product?.name || "Unknown",
            userName: m.buyerName || "Unknown",
            userEmail: m.buyerEmail || "No email",
            telegramUsername: m.telegramUsername,
            telegramLinked: !!m.telegramLinkedAt,
            inviteLink: m.inviteLink,
        }));
    }),

    listPayments: protectedProcedure.query(async ({ ctx }) => {
        const creator = await ctx.db.query.creators.findFirst({
            where: eq(creators.userId, ctx.user.id),
        });

        if (!creator) return [];

        const creatorProducts = await ctx.db.query.products.findMany({
            where: eq(products.creatorId, creator.id),
        });

        if (creatorProducts.length === 0) return [];
        const productIds = creatorProducts.map((p) => p.id);

        // Fetch real payments joined with memberships and products
        const paymentRecords = await ctx.db
            .select({
                id: payments.id,
                amount: payments.amount,
                status: payments.status,
                createdAt: payments.createdAt,
                gatewayPaymentId: payments.gatewayPaymentId,
                productName: products.name,
                buyerName: memberships.buyerName,
                buyerEmail: memberships.buyerEmail,
            })
            .from(payments)
            .innerJoin(memberships, eq(payments.subscriptionId, memberships.id))
            .innerJoin(products, eq(memberships.productId, products.id))
            .where(inArray(products.id, productIds))
            .orderBy(desc(payments.createdAt))
            .limit(100);

        return paymentRecords.map((p) => ({
            paymentId: p.gatewayPaymentId || p.id,
            amount: String(p.amount),
            status: p.status,
            createdAt: p.createdAt,
            gateway: "razorpay" as const,
            productName: p.productName || "Unknown",
            userName: p.buyerName || "Unknown",
            userEmail: p.buyerEmail || "No email",
        }));
    }),

    cancelSubscription: protectedProcedure
        .input(z.object({ subscriptionId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const creator = await ctx.db.query.creators.findFirst({
                where: eq(creators.userId, ctx.user.id),
            });
            if (!creator) throw new TRPCError({ code: "UNAUTHORIZED" });

            const membership = await ctx.db.query.memberships.findFirst({
                where: eq(memberships.id, input.subscriptionId),
                with: {
                    product: { with: { community: true } },
                },
            });

            if (!membership || membership.product?.creatorId !== creator.id) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Membership not found" });
            }

            // Cancel on Razorpay if applicable
            if (membership.razorpaySubscriptionId) {
                const user = await ctx.db.query.users.findFirst({
                    where: eq(users.id, ctx.user.id),
                });

                if (user?.razorpayKeyId && user?.razorpayKeySecretEncrypted) {
                    try {
                        const keySecret = decrypt(user.razorpayKeySecretEncrypted);
                        const authHeader = Buffer.from(`${user.razorpayKeyId}:${keySecret}`).toString("base64");

                        await fetch(`https://api.razorpay.com/v1/subscriptions/${membership.razorpaySubscriptionId}/cancel`, {
                            method: "POST",
                            headers: {
                                Authorization: `Basic ${authHeader}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ cancel_at_cycle_end: 1 }),
                        });
                    } catch (err) {
                        console.error("Razorpay cancel error:", err);
                    }
                }
            }

            await ctx.db
                .update(memberships)
                .set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() })
                .where(eq(memberships.id, input.subscriptionId));

            // Schedule removal at period end
            const chatId = membership.product?.community?.platformGroupId;
            if (chatId) {
                try {
                    const queue = getMembershipQueue();
                    const delayMs = Math.max(0, (membership.currentPeriodEnd?.getTime() || Date.now()) - Date.now());
                    await queue.add(JOB_NAMES.REMOVE_MEMBER, {
                        membershipId: membership.id,
                        chatId,
                        reason: "subscription_cancelled" as const,
                    }, { delay: delayMs, attempts: 3, jobId: `remove_${membership.id}_cancel` });
                } catch (err) {
                    console.warn("Queue unavailable:", err);
                }
            }

            // Queue cancellation email
            if (membership.buyerEmail) {
                await notificationsQueue?.add(JOB_NAMES.SEND_EMAIL, {
                    to: membership.buyerEmail,
                    subject: `Subscription Cancelled: ${membership.product?.name}`,
                    templateId: "cancelled",
                    data: {
                        userName: membership.buyerName || membership.buyerEmail.split("@")[0],
                        productName: membership.product?.name || "",
                        endDate: membership.currentPeriodEnd?.toLocaleDateString() || "now",
                    },
                } satisfies SendEmailPayload);
            }

            return { success: true };
        }),

    revokeAccess: protectedProcedure
        .input(z.object({ subscriptionId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const creator = await ctx.db.query.creators.findFirst({
                where: eq(creators.userId, ctx.user.id),
            });
            if (!creator) throw new TRPCError({ code: "UNAUTHORIZED" });

            const membership = await ctx.db.query.memberships.findFirst({
                where: eq(memberships.id, input.subscriptionId),
                with: {
                    product: { with: { community: true } },
                },
            });

            if (!membership || membership.product?.creatorId !== creator.id) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            // Cancel on Razorpay immediately
            if (membership.razorpaySubscriptionId) {
                const user = await ctx.db.query.users.findFirst({
                    where: eq(users.id, ctx.user.id),
                });

                if (user?.razorpayKeyId && user?.razorpayKeySecretEncrypted) {
                    try {
                        const keySecret = decrypt(user.razorpayKeySecretEncrypted);
                        const authHeader = Buffer.from(`${user.razorpayKeyId}:${keySecret}`).toString("base64");

                        await fetch(`https://api.razorpay.com/v1/subscriptions/${membership.razorpaySubscriptionId}/cancel`, {
                            method: "POST",
                            headers: {
                                Authorization: `Basic ${authHeader}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ cancel_at_cycle_end: 0 }),
                        });
                    } catch (err) {
                        console.error("Razorpay cancel error:", err);
                    }
                }
            }

            // Immediate removal
            const chatId = membership.product?.community?.platformGroupId;
            if (chatId) {
                try {
                    const queue = getMembershipQueue();
                    await queue.add(JOB_NAMES.REMOVE_MEMBER, {
                        membershipId: membership.id,
                        chatId,
                        reason: "manual_removal" as const,
                    }, { attempts: 3 });
                } catch (err) {
                    console.warn("Queue unavailable:", err);
                }
            }

            await ctx.db
                .update(memberships)
                .set({ status: "removed", removedAt: new Date(), updatedAt: new Date() })
                .where(eq(memberships.id, input.subscriptionId));

            return { success: true };
        }),

    addMember: protectedProcedure
        .input(z.object({
            email: z.string().email(),
            name: z.string().optional(),
            productId: z.string().uuid(),
            telegramUsername: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const creator = await ctx.db.query.creators.findFirst({
                where: eq(creators.userId, ctx.user.id),
            });
            if (!creator) throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found." });

            const product = await ctx.db.query.products.findFirst({
                where: and(eq(products.id, input.productId), eq(products.creatorId, creator.id)),
                with: { community: true },
            });
            if (!product) throw new TRPCError({ code: "FORBIDDEN", message: "Product not found or access denied." });

            // Check for existing active membership
            const existingMembership = await ctx.db.query.memberships.findMany({
                where: and(
                    eq(memberships.buyerEmail, input.email),
                    eq(memberships.productId, input.productId),
                    inArray(memberships.status, ["active", "pending"]),
                ),
            });

            if (existingMembership.length > 0) {
                throw new TRPCError({ code: "CONFLICT", message: "User already has an active membership." });
            }

            // Create membership directly as active (gift/manual)
            const [newMembership] = await ctx.db.insert(memberships).values({
                productId: product.id,
                communityId: product.communityId || null,
                buyerEmail: input.email,
                buyerName: input.name || input.email.split("@")[0],
                telegramUsername: input.telegramUsername || null,
                status: "active",
                platform: "telegram",
                currentPeriodEnd: null, // No expiry for gift
            }).returning();

            // Enqueue ADD_MEMBER for Telegram invite
            const chatId = product.community?.platformGroupId;
            if (chatId) {
                try {
                    const queue = getMembershipQueue();
                    await queue.add(JOB_NAMES.ADD_MEMBER, {
                        membershipId: newMembership.id,
                        chatId,
                    }, { attempts: 3 });
                } catch (err) {
                    console.warn("Queue unavailable:", err);
                }
            }

            // Queue welcome email
            await notificationsQueue?.add(JOB_NAMES.SEND_EMAIL, {
                to: input.email,
                subject: `Welcome to ${product.name}!`,
                templateId: "welcome",
                data: {
                    userName: input.name || input.email.split("@")[0],
                    productName: product.name,
                    creatorName: creator.brandName || "Creator",
                },
            } satisfies SendEmailPayload);

            return { success: true };
        }),
});
