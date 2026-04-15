import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";
import { db, apiKeysTable, activitiesTable } from "@workspace/db";
import {
  CreateApiKeyBody,
  DeleteApiKeyParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/api-keys", async (_req, res): Promise<void> => {
  const keys = await db.select({
    id: apiKeysTable.id,
    name: apiKeysTable.name,
    prefix: apiKeysTable.prefix,
    projectId: apiKeysTable.projectId,
    lastUsedAt: apiKeysTable.lastUsedAt,
    createdAt: apiKeysTable.createdAt,
  }).from(apiKeysTable).orderBy(apiKeysTable.createdAt);
  res.json(keys);
});

router.post("/api-keys", async (req, res): Promise<void> => {
  const parsed = CreateApiKeyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rawKey = `ocm_${randomBytes(32).toString("hex")}`;
  const prefix = rawKey.substring(0, 12);
  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  const [apiKey] = await db.insert(apiKeysTable).values({
    name: parsed.data.name,
    keyHash,
    prefix,
    projectId: parsed.data.projectId ?? null,
  }).returning();

  await db.insert(activitiesTable).values({
    type: "api_key_created",
    description: `API key "${parsed.data.name}" created`,
  });

  res.status(201).json({
    id: apiKey.id,
    name: apiKey.name,
    key: rawKey,
    prefix: apiKey.prefix,
    projectId: apiKey.projectId,
    createdAt: apiKey.createdAt,
  });
});

router.delete("/api-keys/:id", async (req, res): Promise<void> => {
  const params = DeleteApiKeyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [key] = await db.delete(apiKeysTable).where(eq(apiKeysTable.id, params.data.id)).returning();
  if (!key) {
    res.status(404).json({ error: "API key not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
