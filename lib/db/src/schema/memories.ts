import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { npcsTable } from "./npcs";
import { projectsTable } from "./projects";

export const memoriesTable = pgTable("memories", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull().references(() => npcsTable.id, { onDelete: "cascade" }),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  wallet: text("wallet"),
  text: text("text").notNull(),
  category: text("category").notNull().default("general"),
  importance: real("importance").notNull().default(0.5),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMemorySchema = createInsertSchema(memoriesTable).omit({ id: true, createdAt: true });
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type Memory = typeof memoriesTable.$inferSelect;
