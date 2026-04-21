import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { creators, communities } from "@paygate/db";

import { router, protectedProcedure } from "../init";

export const telegramRouter = router({
    connect: protectedProcedure
        .input(
            z.object({
                inviteLink: z.string().min(1, "Please provide a Telegram group invite link or @username"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const creator = await ctx.db.query.creators.findFirst({
                where: eq(creators.userId, ctx.user.id),
            });
            if (!creator) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Creator profile not found" });
            }

            const token = process.env.TELEGRAM_BOT_TOKEN;
            if (!token) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Telegram bot token not configured" });
            }

            // Extract group identifier
            let identifier = input.inviteLink.trim();
            if (identifier.includes("t.me/")) {
                const parts = identifier.split("t.me/");
                identifier = parts[parts.length - 1].replace(/\/$/, "");
                if (identifier.startsWith("+")) {
                    // It's a private invite link — we can't resolve this directly via Bot API
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Private supergroup detected. Please use the group's @username or make the group public temporarily to connect, then you can make it private again."
                    });
                }
            }

            // Ensure identifier starts with @ if it's a username and not numeric
            const chatId = identifier.startsWith("-") ? identifier : (identifier.startsWith("@") ? identifier : `@${identifier}`);

            // 1. Resolve chat info
            let chat: { id: number; title?: string; username?: string; member_count?: number };
            try {
                const res = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${chatId}`);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = await res.json() as { ok: boolean; result: any; description?: string };
                if (!data.ok) {
                    throw new Error(data.description || "Chat not found");
                }
                chat = data.result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Unknown error";
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Invalid link or group not found: ${message}. Make sure the group is public or the bot is already a member.`
                });
            }

            const platformGroupId = String(chat.id);
            const chatTitle = chat.title || chat.username || platformGroupId;

            // 2. Verify bot is admin and has permissions
            try {
                const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
                const meData = await res.json();
                if (!meData.ok) throw new Error("Could not verify bot identity");
                const botId = meData.result.id;

                const memberRes = await fetch(`https://api.telegram.org/bot${token}/getChatMember?chat_id=${platformGroupId}&user_id=${botId}`);
                const memberData = await memberRes.json();

                if (!memberData.ok) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Bot not found in this group. Add @FluxarBot as an admin first."
                    });
                }

                const botMember = memberData.result;
                if (botMember.status !== "administrator" && botMember.status !== "creator") {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Bot is in the group but needs Admin permissions. Please promote @FluxarBot to Administrator."
                    });
                }

                const canInvite = botMember.can_invite_users || botMember.status === "creator";
                const canRestrict = botMember.can_restrict_members || botMember.status === "creator";

                if (!canInvite || !canRestrict) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Bot needs 'Add Members' and 'Ban Users' permissions to work properly."
                    });
                }
            } catch (err) {
                if (err instanceof TRPCError) throw err;
                const message = err instanceof Error ? err.message : "Unknown error";
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to verify bot status: ${message}`
                });
            }

            // 3. Check if already connected by this creator
            const existing = await ctx.db.query.communities.findFirst({
                where: and(
                    eq(communities.creatorId, creator.id),
                    eq(communities.platformGroupId, platformGroupId)
                ),
            });

            if (existing) {
                await ctx.db.update(communities)
                    .set({ botStatus: "active", chatTitle, name: chatTitle, memberCount: chat.member_count || existing.memberCount || 0, updatedAt: new Date() })
                    .where(eq(communities.id, existing.id));

                return {
                    success: true,
                    community: existing,
                    message: `Updated connection to ${chatTitle}`,
                };
            }

            // 4. Save the community
            const [community] = await ctx.db
                .insert(communities)
                .values({
                    creatorId: creator.id,
                    platform: "telegram",
                    platformGroupId,
                    name: chatTitle,
                    chatTitle,
                    memberCount: chat.member_count || 0,
                    inviteLink: input.inviteLink,
                    botStatus: "active",
                })
                .returning();

            // 5. Send welcome message
            try {
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: platformGroupId,
                        text: "✅ *Fluxar is now active in this group.*\n\nMembers who pay will be auto-added. Non-payers will be automatically removed.",
                        parse_mode: "Markdown",
                    }),
                });
            } catch (err) {
                console.warn("Failed to send welcome message:", err);
            }

            return {
                success: true,
                community,
                message: `✓ Connected to ${chatTitle} (${chat.member_count || "many"} members)`,
            };
        }),

    listCommunities: protectedProcedure.query(async ({ ctx }) => {
        const creator = await ctx.db.query.creators.findFirst({
            where: eq(creators.userId, ctx.user.id),
        });
        if (!creator) return [];

        return ctx.db.query.communities.findMany({
            where: eq(communities.creatorId, creator.id),
            orderBy: (c, { desc }) => [desc(c.createdAt)],
        });
    }),

    disconnect: protectedProcedure
        .input(z.object({ communityId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const creator = await ctx.db.query.creators.findFirst({
                where: eq(creators.userId, ctx.user.id),
            });
            if (!creator) throw new TRPCError({ code: "UNAUTHORIZED" });

            const community = await ctx.db.query.communities.findFirst({
                where: and(
                    eq(communities.id, input.communityId),
                    eq(communities.creatorId, creator.id)
                ),
            });
            if (!community) throw new TRPCError({ code: "NOT_FOUND" });

            await ctx.db
                .delete(communities)
                .where(eq(communities.id, input.communityId));

            return { success: true };
        }),
});
