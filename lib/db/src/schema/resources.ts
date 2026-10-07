import { boolean, pgTable, serial, text } from "drizzle-orm/pg-core";

export const resourcesTable = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  provider: text("provider").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  contact: text("contact").notNull(),
  website: text("website"),
  eligibility: text("eligibility").notNull(),
  tags: text("tags").array().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  deadline: text("deadline"),
});

export type Resource = typeof resourcesTable.$inferSelect;
export type NewResource = typeof resourcesTable.$inferInsert;
