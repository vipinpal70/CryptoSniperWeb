import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  password: text("password").notNull(),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  name: true,
  phone: true,
  password: true,
  apiKey: true,
  apiSecret: true,
});

export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  maxDrawdown: real("max_drawdown").default(0),
  margin: real("margin").default(0),
  config: jsonb("config"),
  isDeployed: boolean("is_deployed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStrategySchema = createInsertSchema(strategies).pick({
  userId: true,
  name: true,
  description: true,
  type: true,
  maxDrawdown: true,
  margin: true,
  config: true,
  isDeployed: true,
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  strategyId: integer("strategy_id"),
  symbol: text("symbol").notNull(),
  exchange: text("exchange").notNull(),
  value: real("value").notNull(),
  entryPrice: real("entry_price").notNull(),
  markPrice: real("mark_price").notNull(),
  unrealizedPnl: real("unrealized_pnl").default(0),
  unrealizedPnlPercentage: real("unrealized_pnl_percentage").default(0),
  realizedPnl: real("realized_pnl").default(0),
  realizedPnlPercentage: real("realized_pnl_percentage").default(0),
  leverage: integer("leverage").default(1),
  positionType: text("position_type").notNull(), // LONG or SHORT
  isIsolated: boolean("is_isolated").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPositionSchema = createInsertSchema(positions).pick({
  userId: true,
  strategyId: true,
  symbol: true,
  exchange: true,
  value: true,
  entryPrice: true,
  markPrice: true,
  unrealizedPnl: true,
  unrealizedPnlPercentage: true,
  realizedPnl: true,
  realizedPnlPercentage: true,
  leverage: true,
  positionType: true,
  isIsolated: true,
});

export const portfolioSnapshots = pgTable("portfolio_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalValue: real("total_value").notNull(),
  btcValue: real("btc_value"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  assets: jsonb("assets"),
});

export const insertPortfolioSnapshotSchema = createInsertSchema(portfolioSnapshots).pick({
  userId: true,
  totalValue: true,
  btcValue: true,
  assets: true,
});

// Types for zod inference
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStrategy = z.infer<typeof insertStrategySchema>;
export type Strategy = typeof strategies.$inferSelect;

export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;

export type InsertPortfolioSnapshot = z.infer<typeof insertPortfolioSnapshotSchema>;
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
