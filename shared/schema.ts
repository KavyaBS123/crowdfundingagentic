import { boolean, integer, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
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
  metaDescription: text("meta_description"),
  videoUrl: text("video_url"),
  videoThumbnail: text("video_thumbnail"),
  storySections: text("story_sections", { mode: "json" }),
  stretchGoals: text("stretch_goals", { mode: "json" }),
  timeline: text("timeline", { mode: "json" }),
  team: text("team", { mode: "json" }),
  risks: text("risks"),
  owner: text("owner").notNull(),
  target: numeric("target").notNull(),
  deadline: timestamp("deadline").notNull(),
  amountCollected: numeric("amountCollected").default("0").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  pId: integer("pid"), // Campaign ID from blockchain
  createdAt: timestamp("created_at").defaultNow().notNull(),
  requiresVerification: boolean("requires_verification").default(true).notNull(),
  creatorVerified: boolean("creator_verified").default(false),
  rewards: text("rewards", { mode: "json" }),
  faq: text("faq", { mode: "json" }),
  updates: text("updates", { mode: "json" }),
  comments: text("comments", { mode: "json" }),
  community: text("community", { mode: "json" })
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

export const savedCampaigns = pgTable("saved_campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  campaignId: integer("campaign_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
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
export type User = typeof users.$inferSelect & {
  badges?: string[];
  streakCount?: number;
  lastDonationTime?: Date;
};

export type InsertUser = z.infer<typeof insertUserSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

export type GptInteraction = typeof gptInteractions.$inferSelect;
export type InsertGptInteraction = z.infer<typeof insertGptInteractionSchema>;
