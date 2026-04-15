import { Router, type IRouter } from "express";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { db, memoriesTable, transactionsTable, balancesTable } from "@workspace/db";
import {
  GetNpcMemoryParams,
  GetNpcMemoryQueryParams,
  SearchMemoryBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/v1/memory/:npcId", async (req, res): Promise<void> => {
  const params = GetNpcMemoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = GetNpcMemoryQueryParams.safeParse(req.query);
  const limit = query.success ? query.data.limit ?? 50 : 50;

  const memories = await db
    .select()
    .from(memoriesTable)
    .where(eq(memoriesTable.npcId, params.data.npcId))
    .orderBy(desc(memoriesTable.createdAt))
    .limit(limit);

  res.json(memories);
});

router.post("/v1/memory/search", async (req, res): Promise<void> => {
  const parsed = SearchMemoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { npcId, query, limit } = parsed.data;
  const searchLimit = limit ?? 10;

  const memories = await db
    .select()
    .from(memoriesTable)
    .where(
      and(
        eq(memoriesTable.npcId, npcId),
        ilike(memoriesTable.text, `%${query}%`)
      )
    )
    .orderBy(desc(memoriesTable.importance))
    .limit(searchLimit);

  const [balance] = await db.select().from(balancesTable).limit(1);
  if (balance) {
    await db.update(balancesTable).set({ balance: balance.balance - 1, lastUpdated: new Date() }).where(eq(balancesTable.id, balance.id));
  }

  await db.insert(transactionsTable).values({
    type: "memory_search",
    amount: 1,
    description: `Memory search for NPC #${npcId}: "${query.substring(0, 50)}"`,
    npcId,
  });

  res.json(memories);
});

export default router;
