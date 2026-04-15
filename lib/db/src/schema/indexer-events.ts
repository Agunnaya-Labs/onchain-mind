import { pgTable, text, serial, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const indexerEventsTable = pgTable("indexer_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  blockNumber: integer("block_number").notNull(),
  txHash: text("tx_hash").notNull(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  amount: real("amount").notNull().default(0),
  data: text("data").default(""),
  processed: boolean("processed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertIndexerEventSchema = createInsertSchema(indexerEventsTable).omit({ id: true, createdAt: true });
export type InsertIndexerEvent = z.infer<typeof insertIndexerEventSchema>;
export type IndexerEvent = typeof indexerEventsTable.$inferSelect;
