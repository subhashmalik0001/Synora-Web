import { TRPCError } from "@trpc/server";
import { creators, products, memberships, payments } from "@paygate/db/schema";
import { eq, sql, and, gte, count, desc, inArray } from "drizzle-orm";

import { router, protectedProcedure } from "../init";

export const analyticsRouter = router({
    getDashboardMetrics: protectedProcedure.query(async ({ ctx }) => {
        // 1. Get creator profile for current user
        const creator = await ctx.db.query.creators.findFirst({
            where: eq(creators.userId, ctx.user.id),
        });

        if (!creator) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Creator profile not found",
            });
        }

        // 2. Calculate Revenue & Velocity from Payments
        const paymentsData = await ctx.db
            .select({
                amount: payments.amount,
                status: payments.status,
                paidAt: payments.paidAt,
            })
            .from(payments)
            .innerJoin(memberships, eq(payments.subscriptionId, memberships.id))
            .innerJoin(products, eq(memberships.productId, products.id))
            .where(eq(products.creatorId, creator.id));

        const totalRevenue = paymentsData
            .filter(p => p.status === 'captured')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);

        // 3. Calculate MRR based on active memberships and their product pricing
        const activeMemberships = await ctx.db.query.memberships.findMany({
            where: and(
                eq(memberships.status, "active"),
                inArray(memberships.productId, (await ctx.db.query.products.findMany({
                    where: eq(products.creatorId, creator.id),
                    columns: { id: true }
                })).map(p => p.id))
            ),
            with: { product: true }
        });

        const mrr = activeMemberships.reduce((acc, m) => {
            const price = m.product?.pricePaise || 0;
            const interval = m.product?.billingInterval || 'monthly';
            if (interval === 'monthly') return acc + price;
            if (interval === 'quarterly') return acc + (price / 3);
            if (interval === 'yearly') return acc + (price / 12);
            return acc;
        }, 0);

        const activeMembers = activeMemberships.length;

        // 4. New This Month
        const startOfMonth = new Date();
        startOfMonth.setUTCDate(1);
        startOfMonth.setUTCHours(0, 0, 0, 0);

        const newThisMonth = activeMemberships.filter(m => m.createdAt >= startOfMonth).length;

        // 5. Churn Calculation
        const cancelledThisMonth = await ctx.db
            .select({ count: count(memberships.id) })
            .from(memberships)
            .innerJoin(products, eq(memberships.productId, products.id))
            .where(
                and(
                    eq(products.creatorId, creator.id),
                    eq(memberships.status, "cancelled"),
                    gte(memberships.cancelledAt, startOfMonth)
                )
            );

        const churnCount = cancelledThisMonth[0]?.count || 0;
        const churnRate = (activeMembers + churnCount) > 0
            ? (churnCount / (activeMembers + churnCount)) * 100
            : 0;

        return {
            mrr,
            activeMembers,
            newThisMonth,
            churnRate: Number(churnRate.toFixed(2)),
            totalRevenue,
        };
    }),

    getRevenueChart: protectedProcedure.query(async ({ ctx }) => {
        try {
            const creator = await ctx.db.query.creators.findFirst({
                where: eq(creators.userId, ctx.user.id),
            });
            if (!creator) return [];

            const payRecords = await ctx.db
                .select({
                    paidAt: payments.paidAt,
                    amount: payments.amount,
                })
                .from(payments)
                .innerJoin(memberships, eq(payments.subscriptionId, memberships.id))
                .innerJoin(products, eq(memberships.productId, products.id))
                .where(
                    and(
                        eq(products.creatorId, creator.id),
                        eq(payments.status, "captured")
                    )
                )
                .orderBy(desc(payments.paidAt));

            if (payRecords.length === 0) return [];

            const dailyMap = new Map<string, number>();
            payRecords.forEach((p) => {
                const dateStr = (p.paidAt || new Date()).toISOString().split("T")[0];
                dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + (p.amount || 0));
            });

            const sortedDates = Array.from(dailyMap.keys()).sort();
            let cumulative = 0;

            return sortedDates.map((date) => {
                cumulative += dailyMap.get(date)!;
                return {
                    date,
                    revenue: cumulative,
                };
            });
        } catch (error: any) {
            console.error("DEBUG_ANALYTICS_ERROR: getRevenueChart failed", error.message);
            return [];
        }
    }),

    getProductsBreakdown: protectedProcedure.query(async ({ ctx }) => {
        const creator = await ctx.db.query.creators.findFirst({
            where: eq(creators.userId, ctx.user.id),
        });
        if (!creator) return [];

        const productsList = await ctx.db.query.products.findMany({
            where: eq(products.creatorId, creator.id),
        });

        const breakdown = await Promise.all(productsList.map(async (p) => {
            const stats = await ctx.db
                .select({
                    memberCount: count(memberships.id),
                    revenue: sql<number>`SUM(CASE WHEN ${payments.status} = 'captured' THEN ${payments.amount} ELSE 0 END)`.mapWith(Number),
                })
                .from(memberships)
                .leftJoin(payments, eq(memberships.id, payments.subscriptionId))
                .where(eq(memberships.productId, p.id));

            return {
                id: p.id,
                name: p.name,
                memberCount: stats[0]?.memberCount || 0,
                revenue: stats[0]?.revenue || 0,
            };
        }));

        const totalRevenue = breakdown.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

        return breakdown
            .sort((a, b) => b.revenue - a.revenue)
            .map((item) => ({
                ...item,
                percent: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
            }));
    }),

    getMemberGrowthChart: protectedProcedure.query(async ({ ctx }) => {
        const creator = await ctx.db.query.creators.findFirst({
            where: eq(creators.userId, ctx.user.id),
        });
        if (!creator) return [];

        const members = await ctx.db
            .select({
                createdAt: memberships.createdAt,
            })
            .from(memberships)
            .innerJoin(products, eq(memberships.productId, products.id))
            .where(eq(products.creatorId, creator.id))
            .orderBy(desc(memberships.createdAt));

        const dailyMap = new Map<string, number>();
        members.forEach((m) => {
            const dateStr = m.createdAt.toISOString().split("T")[0];
            dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
        });

        const sortedDates = Array.from(dailyMap.keys()).sort();
        let cumulative = 0;

        return sortedDates.map((date) => {
            cumulative += dailyMap.get(date)!;
            return {
                date,
                members: cumulative,
            };
        });
    }),
});
