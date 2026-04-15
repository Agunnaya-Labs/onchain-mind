import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, balancesTable, transactionsTable, activitiesTable } from "@workspace/db";
import {
  ListTransactionsQueryParams,
  DepositAglBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/billing/balance", async (_req, res): Promise<void> => {
  let [balance] = await db.select().from(balancesTable).limit(1);
  if (!balance) {
    [balance] = await db.insert(balancesTable).values({
      balance: 1000,
      walletAddress: "0x0000000000000000000000000000000000000000",
      tokenAddress: "0xea1221b4d80a89bd8c75248fae7c176bd1854698",
    }).returning();
  }
  res.json(balance);
});

router.get("/billing/transactions", async (req, res): Promise<void> => {
  const query = ListTransactionsQueryParams.safeParse(req.query);
  const limit = query.success ? query.data.limit ?? 50 : 50;

  const transactions = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.createdAt))
    .limit(limit);

  res.json(transactions);
});

router.post("/billing/deposit", async (req, res): Promise<void> => {
  const parsed = DepositAglBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let [balance] = await db.select().from(balancesTable).limit(1);
  if (!balance) {
    [balance] = await db.insert(balancesTable).values({
      balance: parsed.data.amount,
      walletAddress: "0x0000000000000000000000000000000000000000",
      tokenAddress: "0xea1221b4d80a89bd8c75248fae7c176bd1854698",
    }).returning();
  } else {
    [balance] = await db.update(balancesTable).set({
      balance: balance.balance + parsed.data.amount,
      lastUpdated: new Date(),
    }).where(eq(balancesTable.id, balance.id)).returning();
  }

  await db.insert(transactionsTable).values({
    type: "deposit",
    amount: parsed.data.amount,
    description: `Deposited ${parsed.data.amount} AGL tokens`,
  });

  await db.insert(activitiesTable).values({
    type: "deposit",
    description: `Deposited ${parsed.data.amount} AGL tokens`,
    aglAmount: parsed.data.amount,
  });

  res.json(balance);
});

export default router;
