import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const symptomChecks = pgTable("symptom_checks", {
  id: serial("id").primaryKey(),
  symptoms: text("symptoms").array().notNull(),
  description: text("description"),
  riskScore: integer("risk_score").notNull(),
  riskLevel: text("risk_level").notNull(),
  possibleConditions: text("possible_conditions").array().notNull(),
  recommendedAction: text("recommended_action").notNull(),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSymptomCheckSchema = createInsertSchema(symptomChecks).omit({
  id: true,
  createdAt: true,
});

export type InsertSymptomCheck = z.infer<typeof insertSymptomCheckSchema>;
export type SymptomCheck = typeof symptomChecks.$inferSelect;

export type CreateSymptomCheckRequest = {
  symptoms: string[];
  description?: string;
};
