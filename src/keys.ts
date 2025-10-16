import { randomBytes } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { authMiddleware } from "./auth/middleware";
import { db, schema } from "./db";

/**
 * Generate a secure API key with sk_ prefix
 */
function generateApiKey(): string {
	const bytes = randomBytes(32);
	return `sk_${bytes.toString("hex")}`;
}

/**
 * Create a new API key for the authenticated user
 */
export const createKey = createServerFn()
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			name: z.string().min(1),
		}),
	)
	.handler(async ({ context, data }) => {
		const userId = context.auth.user.id;
		const apiKeyValue = generateApiKey();
		const id = randomBytes(16).toString("hex");

		const [newKey] = await db
			.insert(schema.apiKey)
			.values({
				id,
				name: data.name,
				key: apiKeyValue,
				userId,
			})
			.returning();

		return newKey;
	});

/**
 * List all API keys for the authenticated user
 */
export const listKeys = createServerFn()
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const userId = context.auth.user.id;

		const keys = await db
			.select({
				id: schema.apiKey.id,
				name: schema.apiKey.name,
				key: schema.apiKey.key,
				createdAt: schema.apiKey.createdAt,
			})
			.from(schema.apiKey)
			.where(eq(schema.apiKey.userId, userId))
			.orderBy(schema.apiKey.createdAt);

		return keys;
	});

/**
 * Delete an API key by ID (only if it belongs to the authenticated user)
 */
export const deleteKey = createServerFn()
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			id: z.string().min(1),
		}),
	)
	.handler(async ({ context, data }) => {
		const userId = context.auth.user.id;

		// Delete the key only if it belongs to the authenticated user
		const result = await db
			.delete(schema.apiKey)
			.where(
				and(eq(schema.apiKey.id, data.id), eq(schema.apiKey.userId, userId)),
			)
			.returning();

		if (result.length === 0) {
			throw new Error("API key not found or unauthorized");
		}

		return { success: true, id: data.id };
	});
