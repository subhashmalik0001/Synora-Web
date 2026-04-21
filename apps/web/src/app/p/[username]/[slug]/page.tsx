import { notFound } from "next/navigation";
import { eq, and, count, sql } from "drizzle-orm";
import { db } from "@paygate/db";
import { creators, products, subscriptions, users } from "@paygate/db/schema";

import { CheckoutButton } from "./checkout-button";

interface PageProps {
    params: Promise<{ username: string; slug: string }>;
}

export default async function PublicPaymentPage({ params }: PageProps) {
    const { username, slug } = await params;

    // Fetch creator
    const creatorResult = await db
        .select()
        .from(creators)
        .where(eq(creators.slug, username))
        .limit(1);
    const creator = creatorResult[0];
    if (!creator) notFound();

    const creatorUserResult = await db
        .select()
        .from(users)
        .where(eq(users.id, creator.userId))
        .limit(1);
    const creatorUser = creatorUserResult[0];

    // Fetch product
    const productResult = await db
        .select()
        .from(products)
        .where(and(
            eq(products.slug, slug),
            eq(products.creatorId, creator.id),
            eq(products.status, "active")
        ))
        .limit(1);
    const product = productResult[0];
    if (!product) notFound();

    // Get member count
    const memberCountResult = await db
        .select({ count: count(subscriptions.id) })
        .from(subscriptions)
        .where(
            and(
                eq(subscriptions.productId, product.id),
                sql`${subscriptions.status} IN ('active', 'trialing')`
            )
        );
    const memberCount = memberCountResult[0]?.count || 0;

    const formatPrice = (paise: number) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);

    const billingLabel =
        product.billingInterval === "monthly"
            ? "/month"
            : product.billingInterval === "quarterly"
                ? "/quarter"
                : product.billingInterval === "yearly"
                    ? "/year"
                    : "";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50">
            <div className="mx-auto max-w-lg px-4 py-12">
                {/* Creator info */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-2xl font-bold shadow-lg shadow-brand-600/20">
                        {(creator.brandName?.[0] || "P").toUpperCase()}
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{creator.brandName}</h2>
                    {creator.bio && (
                        <p className="mt-1 text-sm text-gray-500">{creator.bio}</p>
                    )}
                </div>

                {/* Product card */}
                <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                        {product.description && (
                            <p className="mt-2 text-gray-500">{product.description}</p>
                        )}

                        <div className="mt-6 flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                                {formatPrice(product.pricePaise)}
                            </span>
                            {billingLabel && (
                                <span className="text-lg text-gray-400">{billingLabel}</span>
                            )}
                        </div>

                        {memberCount > 0 && (
                            <p className="mt-3 text-sm text-gray-500">
                                <span className="font-semibold text-gray-700">{memberCount}</span> active members
                            </p>
                        )}
                    </div>

                    <div className="mt-8 space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                            <span className="text-lg">📱</span>
                            <span>Access to private Telegram group</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                            <span className="text-lg">🔒</span>
                            <span>Instant access after payment</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                            <span className="text-lg">💳</span>
                            <span>UPI, Cards & Net Banking accepted</span>
                        </div>
                        {product.billingInterval !== "one_time" && (
                            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                                <span className="text-lg">🔄</span>
                                <span>Cancel anytime — no lock-in</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <CheckoutButton
                            productId={product.id}
                            creatorSlug={creator.slug}
                            productSlug={product.slug}
                            price={formatPrice(product.pricePaise)}
                            billingInterval={product.billingInterval}
                            razorpayKeyId={creatorUser?.razorpayKeyId || undefined}
                        />
                    </div>

                    <p className="mt-4 text-center text-xs text-gray-400">
                        Payments secured by Razorpay. 256-bit SSL encryption.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        Powered by <span className="font-semibold text-brand-600">Fluxar</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
