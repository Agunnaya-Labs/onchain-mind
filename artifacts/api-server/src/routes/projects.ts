import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, projectsTable, npcsTable, chatMessagesTable, transactionsTable, activitiesTable } from "@workspace/db";
import {
  CreateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  UpdateProjectBody,
  DeleteProjectParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  const result = await Promise.all(
    projects.map(async (p) => {
      const [npcCount] = await db.select({ count: sql<number>`count(*)::int` }).from(npcsTable).where(eq(npcsTable.projectId, p.id));
      const [chatCount] = await db.select({ count: sql<number>`count(*)::int` }).from(chatMessagesTable)
        .innerJoin(npcsTable, eq(chatMessagesTable.npcId, npcsTable.id))
        .where(eq(npcsTable.projectId, p.id));
      const [aglData] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)::real` }).from(transactionsTable).where(eq(transactionsTable.projectId, p.id));
      return {
        ...p,
        npcCount: npcCount?.count ?? 0,
        totalApiCalls: chatCount?.count ?? 0,
        aglSpent: aglData?.total ?? 0,
      };
    })
  );
  res.json(result);
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [project] = await db.insert(projectsTable).values(parsed.data).returning();
  await db.insert(activitiesTable).values({
    type: "project_created",
    description: `Project "${parsed.data.name}" created`,
    projectName: parsed.data.name,
  });
  res.status(201).json({ ...project, npcCount: 0, totalApiCalls: 0, aglSpent: 0 });
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, params.data.id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const [npcCount] = await db.select({ count: sql<number>`count(*)::int` }).from(npcsTable).where(eq(npcsTable.projectId, project.id));
  const [chatCount] = await db.select({ count: sql<number>`count(*)::int` }).from(chatMessagesTable)
    .innerJoin(npcsTable, eq(chatMessagesTable.npcId, npcsTable.id))
    .where(eq(npcsTable.projectId, project.id));
  const [aglData] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)::real` }).from(transactionsTable).where(eq(transactionsTable.projectId, project.id));
  res.json({
    ...project,
    npcCount: npcCount?.count ?? 0,
    totalApiCalls: chatCount?.count ?? 0,
    aglSpent: aglData?.total ?? 0,
  });
});

router.patch("/projects/:id", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [project] = await db.update(projectsTable).set(parsed.data).where(eq(projectsTable.id, params.data.id)).returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json({ ...project, npcCount: 0, totalApiCalls: 0, aglSpent: 0 });
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [project] = await db.delete(projectsTable).where(eq(projectsTable.id, params.data.id)).returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
