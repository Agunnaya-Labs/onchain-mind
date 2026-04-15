import { Router, type IRouter } from "express";
import { eq, desc, sql, ilike } from "drizzle-orm";
import { db, npcsTable, chatMessagesTable, memoriesTable, transactionsTable, balancesTable, activitiesTable, projectsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  NpcChatBody,
  GetNpcChatHistoryParams,
  GetNpcChatHistoryQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/v1/npc/chat", async (req, res): Promise<void> => {
  const parsed = NpcChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { npcId, message, wallet } = parsed.data;
  const [npc] = await db.select().from(npcsTable).where(eq(npcsTable.id, npcId));
  if (!npc) {
    res.status(404).json({ error: "NPC not found" });
    return;
  }

  const recentMessages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.npcId, npcId))
    .orderBy(desc(chatMessagesTable.createdAt))
    .limit(10);

  const memories = await db
    .select()
    .from(memoriesTable)
    .where(eq(memoriesTable.npcId, npcId))
    .orderBy(desc(memoriesTable.createdAt))
    .limit(5);

  const memoryRecalled = memories.map((m) => m.text);

  const memoryContext = memoryRecalled.length > 0
    ? `\n\nYou recall the following from your memory:\n${memoryRecalled.map((m) => `- ${m}`).join("\n")}`
    : "";

  const chatHistory = recentMessages.reverse().map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      {
        role: "system",
        content: `${npc.systemPrompt}\n\nYour personality: ${npc.personality}${memoryContext}\n\nWhen you recall something from memory, naturally weave it into the conversation. You can say things like "I remember..." or reference past interactions.`,
      },
      ...chatHistory,
      { role: "user", content: message },
    ],
  });

  const responseText = completion.choices[0]?.message?.content ?? "I'm unable to respond right now.";

  await db.insert(chatMessagesTable).values([
    { npcId, role: "user", content: message, wallet: wallet ?? null, aglCharged: 0 },
    { npcId, role: "assistant", content: responseText, aglCharged: 2 },
  ]);

  const keywords = message.split(/\s+/).filter((w) => w.length > 4).slice(0, 3);
  if (keywords.length > 0) {
    await db.insert(memoriesTable).values({
      npcId,
      projectId: npc.projectId,
      wallet: wallet ?? null,
      text: `User said: "${message.substring(0, 200)}"`,
      category: "conversation",
      importance: 0.5,
    });
  }

  const [balance] = await db.select().from(balancesTable).limit(1);
  if (balance) {
    await db.update(balancesTable).set({ balance: balance.balance - 3, lastUpdated: new Date() }).where(eq(balancesTable.id, balance.id));
  }

  await db.insert(transactionsTable).values([
    { type: "chat", amount: 2, description: `Chat with NPC "${npc.name}"`, projectId: npc.projectId, npcId },
    { type: "memory_write", amount: 1, description: `Memory stored for NPC "${npc.name}"`, projectId: npc.projectId, npcId },
  ]);

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, npc.projectId));
  await db.insert(activitiesTable).values({
    type: "chat",
    description: `Chat with NPC "${npc.name}"`,
    projectName: project?.name ?? "",
    npcName: npc.name,
    aglAmount: 3,
  });

  res.json({
    response: responseText,
    npcId,
    memoryRecalled,
    aglCharged: 3,
    timestamp: new Date().toISOString(),
  });
});

router.get("/npcs/:npcId/chat-history", async (req, res): Promise<void> => {
  const params = GetNpcChatHistoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = GetNpcChatHistoryQueryParams.safeParse(req.query);
  const limit = query.success ? query.data.limit ?? 50 : 50;

  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.npcId, params.data.npcId))
    .orderBy(desc(chatMessagesTable.createdAt))
    .limit(limit);

  res.json(messages.reverse());
});

export default router;
