import { Router, type IRouter } from "express";
import { eq, sql, desc, gte, and, count } from "drizzle-orm";
import { db, npcsTable, chatMessagesTable, memoriesTable, transactionsTable, balancesTable, projectsTable, activitiesTable } from "@workspace/db";
import {
  GetUsageQueryParams,
  GetAnalyticsTimelineQueryParams,
  GetRecentActivityQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/v1/usage", async (req, res): Promise<void> => {
  const query = GetUsageQueryParams.safeParse(req.query);

  const [chatCount] = await db.select({ count: sql<number>`count(*)::int` }).from(chatMessagesTable).where(eq(chatMessagesTable.role, "user"));
  const [memCount] = await db.select({ count: sql<number>`count(*)::int` }).from(memoriesTable);
  const [searchCount] = await db.select({ count: sql<number>`count(*)::int` }).from(transactionsTable).where(eq(transactionsTable.type, "memory_search"));
  const [activeNpcs] = await db.select({ count: sql<number>`count(*)::int` }).from(npcsTable).where(eq(npcsTable.status, "active"));
  const [aglData] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)::real` }).from(transactionsTable).where(sql`type != 'deposit'`);

  const totalApiCalls = (chatCount?.count ?? 0) + (memCount?.count ?? 0) + (searchCount?.count ?? 0);

  res.json({
    totalApiCalls,
    totalAglSpent: aglData?.total ?? 0,
    activeNpcs: activeNpcs?.count ?? 0,
    totalMemoryWrites: memCount?.count ?? 0,
    totalChats: chatCount?.count ?? 0,
    totalSearches: searchCount?.count ?? 0,
  });
});

router.get("/analytics/timeline", async (req, res): Promise<void> => {
  const query = GetAnalyticsTimelineQueryParams.safeParse(req.query);
  const days = query.success ? query.data.days ?? 7 : 7;

  const points = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const [chats] = await db.select({ count: sql<number>`count(*)::int` })
      .from(chatMessagesTable)
      .where(and(
        eq(chatMessagesTable.role, "user"),
        sql`date(${chatMessagesTable.createdAt}) = ${dateStr}`
      ));
    const [mems] = await db.select({ count: sql<number>`count(*)::int` })
      .from(memoriesTable)
      .where(sql`date(${memoriesTable.createdAt}) = ${dateStr}`);
    const [agl] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)::real` })
      .from(transactionsTable)
      .where(and(
        sql`type != 'deposit'`,
        sql`date(${transactionsTable.createdAt}) = ${dateStr}`
      ));

    points.push({
      date: dateStr,
      apiCalls: (chats?.count ?? 0) + (mems?.count ?? 0),
      aglSpent: agl?.total ?? 0,
      chats: chats?.count ?? 0,
      memoryWrites: mems?.count ?? 0,
    });
  }

  res.json(points);
});

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [projectCount] = await db.select({ count: sql<number>`count(*)::int` }).from(projectsTable);
  const [npcCount] = await db.select({ count: sql<number>`count(*)::int` }).from(npcsTable);
  const [activeNpcs] = await db.select({ count: sql<number>`count(*)::int` }).from(npcsTable).where(eq(npcsTable.status, "active"));
  const [chatCount] = await db.select({ count: sql<number>`count(*)::int` }).from(chatMessagesTable).where(eq(chatMessagesTable.role, "user"));
  const [memCount] = await db.select({ count: sql<number>`count(*)::int` }).from(memoriesTable);
  const [aglData] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)::real` }).from(transactionsTable).where(sql`type != 'deposit'`);

  let [balance] = await db.select().from(balancesTable).limit(1);
  if (!balance) {
    [balance] = await db.insert(balancesTable).values({
      balance: 1000,
      walletAddress: "0x0000000000000000000000000000000000000000",
      tokenAddress: "0xea1221b4d80a89bd8c75248fae7c176bd1854698",
    }).returning();
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [recentChats] = await db.select({ count: sql<number>`count(*)::int` })
    .from(chatMessagesTable)
    .where(and(
      eq(chatMessagesTable.role, "user"),
      gte(chatMessagesTable.createdAt, sevenDaysAgo)
    ));

  res.json({
    totalProjects: projectCount?.count ?? 0,
    totalNpcs: npcCount?.count ?? 0,
    activeNpcs: activeNpcs?.count ?? 0,
    totalApiCalls: (chatCount?.count ?? 0) + (memCount?.count ?? 0),
    totalAglSpent: aglData?.total ?? 0,
    aglBalance: balance?.balance ?? 0,
    totalMemories: memCount?.count ?? 0,
    recentChatCount: recentChats?.count ?? 0,
  });
});

router.get("/dashboard/recent-activity", async (req, res): Promise<void> => {
  const query = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = query.success ? query.data.limit ?? 10 : 10;

  const activities = await db
    .select()
    .from(activitiesTable)
    .orderBy(desc(activitiesTable.createdAt))
    .limit(limit);

  res.json(activities);
});

export default router;
