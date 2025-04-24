import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Board schema
export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
});

export const insertBoardSchema = createInsertSchema(boards).pick({
  name: true,
  description: true,
  userId: true,
});

export type InsertBoard = z.infer<typeof insertBoardSchema>;
export type Board = typeof boards.$inferSelect;

// List schema
export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  boardId: integer("board_id").notNull(),
});

export const insertListSchema = createInsertSchema(lists).pick({
  title: true,
  boardId: true,
});

export type InsertList = z.infer<typeof insertListSchema>;
export type List = typeof lists.$inferSelect;

// Card schema
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("todo"),
  dueDate: text("due_date"),
  listId: integer("list_id").notNull(),
  labels: jsonb("labels").$type<string[]>().default([]),
  attachments: jsonb("attachments").$type<string[]>().default([]),
  isDeleted: boolean("is_deleted").default(false),
});

export const insertCardSchema = createInsertSchema(cards).pick({
  title: true,
  description: true,
  status: true,
  dueDate: true,
  listId: true,
  labels: true,
  attachments: true,
});

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;
