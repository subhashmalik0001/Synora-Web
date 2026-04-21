import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, count, inArray } from "drizzle-orm";
import { creators, products, memberships } from "@paygate/db";

import { router, protectedProcedure, publicProcedure } from "../init";

export const productsRouter = router({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1, "Product name is required"),
                description: z.string().max(300).optional(),
                pricePaise: z.number().int().min(100, "Minimum price is ₹1"),
                billingInterval: z.enum(["monthly", "quarterly", "yearly", "one_time", "lifetime"]),
                communityId: z.string().uuid().optional(),
                status: z.enum(["draft", "active"]).default("draft"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const creator = await ctx.db.query.creators.findFirst({
                where: eq(creators.userId, ctx.user.id),
            });
            if (!creator) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found. Complete onboarding first." });
            }

            // Generate slug
            const baseName = input.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_]+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-+|-+$/g, "");

            // Check for existing slugs
            const existingProducts = await ctx.db
                .select({ slug: products.slug })
                .from(products)
                .where(eq(products.creatorId, creator.id));
            const existingSlugs = existingProducts.map((p) => p.slug);

            let slug = baseName;
            let counter = 1;
            while (existingSlugs.includes(slug)) {
                slug = `${baseName}-${counter}`;
                counter++;
            }

            const [product] = await ctx.db
                .insert(products)
                .values({
                    creatorId: creator.id,
                    name: input.name,
                    description: input.description || null,
                    pricePaise: input.pricePaise,
                    billingInterval: input.billingInterval,
                    communityId: input.communityId || null,
                    status: input.status,
                    slug,
                    isActive: input.status === "active",
                })
                .returning();

            const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/p/${creator.slug}/${slug}`;

            return { ...product, paymentUrl };
        }),

    list: protectedProcedure.query(async ({ ctx }) => {
        const creator = await ctx.db.query.creators.findFirst({
            where: eq(creators.userId, ctx.user.id),
        });
        if (!creator) return [];

        const productList = await ctx.db.query.products.findMany({
            where: eq(products.creatorId, creator.id),
            with: {
                community: true,
            },
            orderBy: [desc(products.createdAt)],
        });

        // Get member counts for each product
        let countsMap: Record<string, number> = {};

        if (productList.length > 0) {
            const memberCounts = await ctx.db
                .select({
                    productId: memberships.productId,
                    count: count(memberships.id),
                })
                .from(memberships)
                .where(
                    and(
                        inArray(memberships.productId, productList.map(p => p.id)),
                        eq(memberships.status, 'active')
                    )
                )
                .groupBy(memberships.productId);

            countsMap = Object.fromEntries(
                memberCounts.map((mc) => [mc.productId, mc.count])
            );
        }

        return productList.map((p) => ({
            ...p,
            memberCount: countsMap[p.id] || 0,
            paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/p/${creator.slug}/${p.slug}`,
        }));
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const creator = await ctx.db.query.creators.findFirst({
                where: eq(creators.userId, ctx.user.id),
            });
            if (!creator) throw new TRPCError({ code: "UNAUTHORIZED" });

            const product = await ctx.db.query.products.findFirst({
                where: and(
                    eq(products.id, input.id),
                    eq(products.creatorId, creator.id)
                ),
                with: { community: true },
            });

            if (!product) throw new TRPCError({ code: "NOT_FOUND" });
            return product;
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                name: z.string().min(1).optional(),
                description: z.string().max(300).optional(),
                pricePaise: z.number().int().min(100).optional(),
                status: z.enum(["draft", "active", "paused", "archived"]).optional(),
                communityId: z.string().uuid().nullable().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const creator = await ctx.db.query.creators.findFirst({
                where: eq(creators.userId, ctx.user.id),
            });
            if (!creator) throw new TRPCError({ code: "UNAUTHORIZED" });

            const existing = await ctx.db.query.products.findFirst({
                where: and(
                    eq(products.id, input.id),
                    eq(products.creatorId, creator.id)
                ),
            });
            if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

            const { id, ...updateData } = input;
            const updateValues: Record<string, unknown> = { updatedAt: new Date() };
            if (updateData.name !== undefined) updateValues.name = updateData.name;
            if (updateData.description !== undefined) updateValues.description = updateData.description;
            if (updateData.pricePaise !== undefined) updateValues.pricePaise = updateData.pricePaise;
            if (updateData.status !== undefined) {
                updateValues.status = updateData.status;
                updateValues.isActive = updateData.status === "active";
            }
            if (updateData.communityId !== undefined) updateValues.communityId = updateData.communityId;

            const [updated] = await ctx.db
                .update(products)
                .set(updateValues)
                .where(eq(products.id, id))
                .returning();

            return updated;
        }),

    getPublic: publicProcedure
        .input(z.object({ username: z.string(), slug: z.string() }))
        .query(async ({ ctx, input }) => {
            // Find creator by slug (username)
            const creator = await ctx.db.query.creators.findFirst({
                where: eq(creators.slug, input.username),
                with: { user: true },
            });
            if (!creator) throw new TRPCError({ code: "NOT_FOUND", message: "Creator not found" });

            const product = await ctx.db.query.products.findFirst({
                where: and(
                    eq(products.slug, input.slug),
                    eq(products.creatorId, creator.id),
                    eq(products.status, "active")
                ),
            });
            if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });

            // Get active member count
            const memberCountResult = await ctx.db
                .select({ count: count(memberships.id) })
                .from(memberships)
                .where(
                    and(
                        eq(memberships.productId, product.id),
                        eq(memberships.status, "active")
                    )
                );

            return {
                product,
                creator: {
                    id: creator.id,
                    brandName: creator.brandName,
                    slug: creator.slug,
                    logoUrl: creator.logoUrl,
                    bio: creator.bio,
                    userName: creator.user.name,
                    userImage: creator.user.image,
                },
                memberCount: memberCountResult[0]?.count || 0,
            };
        }),
});
