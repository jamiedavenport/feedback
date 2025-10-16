import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const feedback = pgTable("feedback", {
	id: text().primaryKey(),
	userId: text()
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	content: text().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
});

export const tags = pgTable("tags", {
	id: text().primaryKey(),
	content: text().notNull(),
	feedbackId: text()
		.references(() => feedback.id, { onDelete: "cascade" })
		.notNull(),
});

export const apiKey = pgTable("api_key", {
	id: text().primaryKey(),
	name: text().notNull(),
	key: text().notNull(),
	userId: text()
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	createdAt: timestamp().defaultNow().notNull(),
});
