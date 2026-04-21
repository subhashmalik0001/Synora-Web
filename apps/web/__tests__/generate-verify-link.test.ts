import { POST } from '@/app/api/memberships/generate-verify-link/route'
import { db } from '@paygate/db'
import { memberships, products, users, communities, creators } from '@paygate/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'

// ─── HELPERS ────────────────────────────────────────────────────────────────

async function createTestCreator() {
    const [user] = await db.insert(users).values({
        id: randomUUID(),
        email: `creator_${Date.now()}@test.com`,
        name: 'Test Creator',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning()

    const [creator] = await db.insert(creators).values({
        id: randomUUID(),
        userId: user.id,
        brandName: 'Test Brand',
        slug: `brand-${Date.now()}`,
    }).returning();

    return { user, creator }
}

async function createTestCommunity(creatorId: string) {
    const [community] = await db.insert(communities).values({
        id: randomUUID(),
        creatorId,
        platform: 'telegram',
        platformGroupId: '-1001234567890',
        name: 'Test Trading Group',
        botStatus: 'active',
    }).returning()
    return community
}

async function createTestProduct(creatorId: string, communityId: string) {
    const [product] = await db.insert(products).values({
        id: randomUUID(),
        creatorId,
        communityId,
        name: 'NSE Premium Signals',
        pricePaise: 99900,
        billingInterval: 'monthly',
        slug: `test-product-${randomUUID()}`,
        status: 'active',
    }).returning()
    return product
}

async function createTestMembership(productId: string, overrides = {}) {
    const [membership] = await db.insert(memberships).values({
        id: randomUUID(),
        productId,
        buyerEmail: `buyer_${Date.now()}@test.com`,
        buyerName: 'Test Buyer',
        razorpaySubscriptionId: `sub_test_${Date.now()}`,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ...overrides,
    } as any).returning()
    return membership
}

// ─── TESTS ──────────────────────────────────────────────────────────────────

describe('POST /api/memberships/generate-verify-link', () => {

    let user: any, creator: any, community: any, product: any, membership: any

    beforeEach(async () => {
        const testCreator = await createTestCreator()
        user = testCreator.user
        creator = testCreator.creator
        community = await createTestCommunity(creator.id)
        product = await createTestProduct(creator.id, community.id)
        membership = await createTestMembership(product.id)
    })

    afterEach(async () => {
        // Clean up test data
        await db.delete(memberships).where(eq(memberships.id, membership.id))
        await db.delete(products).where(eq(products.id, product.id))
        await db.delete(communities).where(eq(communities.id, community.id))
        await db.delete(creators).where(eq(creators.id, creator.id))
        await db.delete(users).where(eq(users.id, user.id))
    })

    // TEST 1.1
    test('generates a valid token for an active membership', async () => {
        const req = new NextRequest('http://localhost/api/memberships/generate-verify-link', {
            method: 'POST',
            body: JSON.stringify({ membershipId: membership.id }),
            headers: { 'Content-Type': 'application/json' },
        })

        const res = await POST(req)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.verifyUrl).toContain('t.me/')
        expect(data.verifyUrl).toContain('tok_')

        // Check DB was updated
        const updated = await db.query.memberships.findFirst({
            where: eq(memberships.id, membership.id)
        })
        expect(updated?.inviteToken).toBeTruthy()
        expect(updated?.inviteToken).toMatch(/^tok_[a-f0-9]{64}$/)
        expect(updated?.inviteTokenExpiresAt).toBeTruthy()

        const expiresAt = updated!.inviteTokenExpiresAt!
        const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
        expect(hoursUntilExpiry).toBeGreaterThan(23)
        expect(hoursUntilExpiry).toBeLessThan(25)
    })

    // TEST 1.2
    test('returns 404 for non-existent membership', async () => {
        const req = new NextRequest('http://localhost/api/memberships/generate-verify-link', {
            method: 'POST',
            body: JSON.stringify({ membershipId: randomUUID() }),
            headers: { 'Content-Type': 'application/json' },
        })

        const res = await POST(req)
        expect(res.status).toBe(404)
    })

    // TEST 1.3
    test('token is unique on every call', async () => {
        const makeRequest = () => POST(new NextRequest(
            'http://localhost/api/memberships/generate-verify-link',
            { method: 'POST', body: JSON.stringify({ membershipId: membership.id }), headers: { 'Content-Type': 'application/json' } }
        ))

        const [res1, res2] = await Promise.all([makeRequest(), makeRequest()])
        const [data1, data2] = await Promise.all([res1.json(), res2.json()])

        // Both should succeed but tokens should be different
        expect(data1.verifyUrl).not.toBe(data2.verifyUrl)
    })

    // TEST 1.4
    test('does not generate token for cancelled membership', async () => {
        const cancelledMembership = await createTestMembership(product.id, {
            status: 'cancelled',
            buyerEmail: `cancelled_${Date.now()}@test.com`,
            razorpaySubscriptionId: `sub_cancelled_${Date.now()}`,
        })

        const req = new NextRequest('http://localhost/api/memberships/generate-verify-link', {
            method: 'POST',
            body: JSON.stringify({ membershipId: cancelledMembership.id }),
            headers: { 'Content-Type': 'application/json' },
        })

        const res = await POST(req)
        expect(res.status).toBe(400)

        await db.delete(memberships).where(eq(memberships.id, cancelledMembership.id))
    })

})