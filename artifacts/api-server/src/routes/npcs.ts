import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, npcsTable, chatMessagesTable, memoriesTable, projectsTable, activitiesTable } from "@workspace/db";
import {
  ListNpcsParams,
  CreateNpcParams,
  CreateNpcBody,
  GetNpcParams,
  UpdateNpcParams,
  UpdateNpcBody,
  DeleteNpcParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects/:projectId/npcs", async (req, res): Promise<void> => {
  const params = ListNpcsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const npcs = await db.select().from(npcsTable).where(eq(npcsTable.projectId, params.data.projectId)).orderBy(npcsTable.createdAt);
  const result = await Promise.all(
    npcs.map(async (npc) => {
      const [msgCount] = await db.select({ count: sql<number>`count(*)::int` }).from(chatMessagesTable).where(eq(chatMessagesTable.npcId, npc.id));
      const [memCount] = await db.select({ count: sql<number>`count(*)::int` }).from(memoriesTable).where(eq(memoriesTable.npcId, npc.id));
      return { ...npc, messageCount: msgCount?.count ?? 0, memoryCount: memCount?.count ?? 0 };
    })
  );
  res.json(result);
});

router.post("/projects/:projectId/npcs", async (req, res): Promise<void> => {
  const params = CreateNpcParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateNpcBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [npc] = await db.insert(npcsTable).values({
    ...parsed.data,
    projectId: params.data.projectId,
    model: parsed.data.model ?? "gpt-5.2",
  }).returning();
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, params.data.projectId));
  await db.insert(activitiesTable).values({
    type: "npc_created",
    description: `NPC "${parsed.data.name}" created`,
    projectName: project?.name ?? "",
    npcName: parsed.data.name,
  });
  res.status(201).json({ ...npc, messageCount: 0, memoryCount: 0 });
});

router.get("/npcs/:id", async (req, res): Promise<void> => {
  const params = GetNpcParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [npc] = await db.select().from(npcsTable).where(eq(npcsTable.id, params.data.id));
  if (!npc) {
    res.status(404).json({ error: "NPC not found" });
    return;
  }
  const [msgCount] = await db.select({ count: sql<number>`count(*)::int` }).from(chatMessagesTable).where(eq(chatMessagesTable.npcId, npc.id));
  const [memCount] = await db.select({ count: sql<number>`count(*)::int` }).from(memoriesTable).where(eq(memoriesTable.npcId, npc.id));
  res.json({ ...npc, messageCount: msgCount?.count ?? 0, memoryCount: memCount?.count ?? 0 });
});

router.patch("/npcs/:id", async (req, res): Promise<void> => {
  const params = UpdateNpcParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateNpcBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [npc] = await db.update(npcsTable).set(parsed.data).where(eq(npcsTable.id, params.data.id)).returning();
  if (!npc) {
    res.status(404).json({ error: "NPC not found" });
    return;
  }
  const [msgCount] = await db.select({ count: sql<number>`count(*)::int` }).from(chatMessagesTable).where(eq(chatMessagesTable.npcId, npc.id));
  const [memCount] = await db.select({ count: sql<number>`count(*)::int` }).from(memoriesTable).where(eq(memoriesTable.npcId, npc.id));
  res.json({ ...npc, messageCount: msgCount?.count ?? 0, memoryCount: memCount?.count ?? 0 });
});

router.delete("/npcs/:id", async (req, res): Promise<void> => {
  const params = DeleteNpcParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [npc] = await db.delete(npcsTable).where(eq(npcsTable.id, params.data.id)).returning();
  if (!npc) {
    res.status(404).json({ error: "NPC not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
