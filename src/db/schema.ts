import { relations } from "drizzle-orm";
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
	status: text()
		.$type<"new" | "resolved" | "archived">()
		.notNull()
		.default("new"),
});

export const feedbackRelations = relations(feedback, ({ one, many }) => ({
	user: one(user, {
		fields: [feedback.userId],
		references: [user.id],
	}),
	tags: many(tags),
}));

export const tags = pgTable("tags", {
	id: text().primaryKey(),
	content: text().notNull(),
	feedbackId: text()
		.references(() => feedback.id, { onDelete: "cascade" })
		.notNull(),
});

export const tagsRelations = relations(tags, ({ one }) => ({
	feedback: one(feedback, {
		fields: [tags.feedbackId],
		references: [feedback.id],
	}),
}));

export const apiKey = pgTable("api_key", {
	id: text().primaryKey(),
	name: text().notNull(),
	key: text().notNull(),
	userId: text()
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	createdAt: timestamp().defaultNow().notNull(),
});

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
	user: one(user, {
		fields: [apiKey.userId],
		references: [user.id],
	}),
}));
