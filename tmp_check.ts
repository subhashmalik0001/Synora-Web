import { db } from "./packages/db/src";
import { subscriptions, payments, memberships, products } from "./packages/db/src/schema";
import { eq } from "drizzle-orm";

async function run() {
    console.log("--- Memberships ---");
    const mems = await db.select().from(memberships);
    console.log(mems.map(m => ({ id: m.id, subId: m.subscriptionId, status: m.status, buyerEmail: m.buyerEmail })));

    console.log("--- Payments ---");
    const pays = await db.select().from(payments);
    console.log(pays.map(p => ({ id: p.id, subId: p.subscriptionId, amount: p.amount, status: p.status })));

    console.log("--- Products ---");
    const prods = await db.select().from(products);
    console.log(prods.map(p => ({ id: p.id, name: p.name, pricePaise: p.pricePaise })));

    process.exit(0);
}
run();
