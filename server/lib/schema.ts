import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const donors = pgTable('donors', {
  id: serial('id').primaryKey(),
  address: text('address').notNull().unique(),
  xp: integer('xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  streakCount: integer('streak_count').notNull().default(0),
  lastDonationTime: timestamp('last_donation_time').notNull().defaultNow(),
  hasWelcomeBadge: boolean('has_welcome_badge').notNull().default(false),
  badges: text('badges').array().notNull().default([]),
  streakHistory: integer('streak_history').array().notNull().default([])
});

export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  donorAddress: text('donor_address').notNull(),
  campaignId: integer('campaign_id').notNull(),
  amount: text('amount').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow()
}); 