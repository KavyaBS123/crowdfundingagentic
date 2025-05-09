import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  address: text("address").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  verificationMethod: text("verification_method"), // "BrightID" or "PolygonID"
  verificationProof: text("verification_proof"), // Proof/credential hash
  verificationTimestamp: timestamp("verification_timestamp"),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  owner: text("owner").notNull(),
  target: numeric("target").notNull(),
  deadline: timestamp("deadline").notNull(),
  amountCollected: numeric("amountCollected").default("0").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  pId: integer("pid"), // Campaign ID from blockchain
  createdAt: timestamp("created_at").defaultNow().notNull(),
  requiresVerification: boolean("requires_verification").default(true).notNull(),
  creatorVerified: boolean("creator_verified").default(false)
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  donator: text("donator").notNull(),
  amount: numeric("amount").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

export const gptInteractions = pgTable("gpt_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  promptText: text("prompt_text").notNull(),
  responseText: text("response_text").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  address: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  amountCollected: true,
  createdAt: true
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  timestamp: true
});

export const insertGptInteractionSchema = createInsertSchema(gptInteractions).omit({
  id: true,
  timestamp: true
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

export type GptInteraction = typeof gptInteractions.$inferSelect;
export type InsertGptInteraction = z.infer<typeof insertGptInteractionSchema>;
