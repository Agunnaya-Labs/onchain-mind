import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const balancesTable = pgTable("balances", {
  id: serial("id").primaryKey(),
  balance: real("balance").notNull().default(1000),
  walletAddress: text("wallet_address").notNull().default("0x0000000000000000000000000000000000000000"),
  tokenAddress: text("token_address").notNull().default("0xea1221b4d80a89bd8c75248fae7c176bd1854698"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
});

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  projectId: integer("project_id"),
  npcId: integer("npc_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBalanceSchema = createInsertSchema(balancesTable).omit({ id: true });
export type InsertBalance = z.infer<typeof insertBalanceSchema>;
export type Balance = typeof balancesTable.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
