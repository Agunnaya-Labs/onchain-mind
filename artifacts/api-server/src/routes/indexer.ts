import { Router, type IRouter } from "express";
import { desc, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db, indexerEventsTable } from "@workspace/db";
import {
  ListIndexerEventsQueryParams,
  SimulateIndexerEventBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/indexer/events", async (req, res): Promise<void> => {
  const query = ListIndexerEventsQueryParams.safeParse(req.query);
  const limit = query.success ? query.data.limit ?? 20 : 20;

  const events = await db
    .select()
    .from(indexerEventsTable)
    .orderBy(desc(indexerEventsTable.createdAt))
    .limit(limit);

  res.json(events);
});

router.post("/indexer/events", async (req, res): Promise<void> => {
  const parsed = SimulateIndexerEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lastEvent] = await db
    .select({ maxBlock: sql<number>`coalesce(max(block_number), 19000000)::int` })
    .from(indexerEventsTable);

  const blockNumber = (lastEvent?.maxBlock ?? 19000000) + Math.floor(Math.random() * 10) + 1;
  const txHash = `0x${randomBytes(32).toString("hex")}`;

  const [event] = await db.insert(indexerEventsTable).values({
    eventType: parsed.data.eventType,
    blockNumber,
    txHash,
    fromAddress: parsed.data.fromAddress,
    toAddress: parsed.data.toAddress,
    amount: parsed.data.amount,
    processed: true,
  }).returning();

  res.status(201).json(event);
});

export default router;
