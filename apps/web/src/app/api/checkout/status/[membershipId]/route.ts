import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@paygate/db";
import { memberships, communities } from "@paygate/db/schema";

interface RouteParams {
    params: Promise<{ membershipId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { membershipId } = await params;

        const membership = await (db as any).query.memberships.findFirst({
            where: eq(memberships.id, membershipId),
        });

        if (!membership) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Membership not found" } },
                { status: 404 }
            );
        }

        let inviteLink: string | null = membership.inviteLink;

        // If active and has a community, fetch community invite link
        if (membership.status === "active" && membership.communityId && !inviteLink) {
            const community = await (db as any).query.communities.findFirst({
                where: eq(communities.id, membership.communityId),
            });
            inviteLink = community?.inviteLink || null;
        }

        return NextResponse.json({
            success: true,
            status: membership.status,
            inviteLink,
            telegramLinked: !!membership.telegramLinkedAt,
        });
    } catch (error) {
        console.error("Checkout status error:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
            { status: 500 }
        );
    }
}
