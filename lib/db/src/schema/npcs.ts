import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const npcsTable = pgTable("npcs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  personality: text("personality").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  model: text("model").notNull().default("gpt-5.2"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertNpcSchema = createInsertSchema(npcsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNpc = z.infer<typeof insertNpcSchema>;
export type Npc = typeof npcsTable.$inferSelect;
