import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const codeConversions = pgTable("code_conversions", {
  id: serial("id").primaryKey(),
  sourceCode: text("source_code").notNull(),
  targetCode: text("target_code").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  explanation: text("explanation").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: text("created_at").notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCodeConversionSchema = createInsertSchema(codeConversions).pick({
  sourceCode: true,
  targetCode: true,
  sourceLanguage: true,
  targetLanguage: true,
  explanation: true,
  userId: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCodeConversion = z.infer<typeof insertCodeConversionSchema>;
export type CodeConversion = typeof codeConversions.$inferSelect;

export const convertCodeSchema = z.object({
  sourceCode: z.string().min(1, "Source code is required"),
  sourceLanguage: z.string().min(1, "Source language is required"),
  targetLanguage: z.string().min(1, "Target language is required"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  generateReadme: z.boolean().optional(),
  generateApi: z.boolean().optional(),
});

export type ConvertCodeRequest = z.infer<typeof convertCodeSchema>;

export const convertCodeResponseSchema = z.object({
  targetCode: z.string(),
  explanation: z.object({
    stepByStep: z.array(z.object({
      title: z.string(),
      sourceCode: z.string(),
      targetCode: z.string(),
      explanation: z.string(),
    })),
    highLevel: z.string(),
    languageDifferences: z.string(),
  }),
  readme: z.string().optional(),
  apiDocs: z.string().optional(),
});

export type ConvertCodeResponse = z.infer<typeof convertCodeResponseSchema>;
