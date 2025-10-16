import { randomBytes } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import z from "zod";
import { db, schema } from "@/db";

const feedbackSchema = z.object({
	content: z.string().min(1),
	tags: z
		.array(
			z.object({
				id: z.string().min(1),
				content: z.string().min(1),
			}),
		)
		.min(1),
});

export const Route = createFileRoute("/api/feedback")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					// Get the API key from the x-api-key header
					const apiKeyHeader = request.headers.get("x-api-key");

					if (!apiKeyHeader) {
						return new Response(
							JSON.stringify({ error: "Missing x-api-key header" }),
							{ status: 401, headers: { "Content-Type": "application/json" } },
						);
					}

					// Validate the API key exists in the database
					const apiKeyRecord = await db.query.apiKey.findFirst({
						where: eq(schema.apiKey.key, apiKeyHeader),
					});

					if (!apiKeyRecord) {
						return new Response(JSON.stringify({ error: "Invalid API key" }), {
							status: 401,
							headers: { "Content-Type": "application/json" },
						});
					}

					// Parse and validate the request body
					const body = await request.json();
					const validationResult = feedbackSchema.safeParse(body);

					if (!validationResult.success) {
						return new Response(
							JSON.stringify({
								error: "Invalid request body",
								details: validationResult.error.issues,
							}),
							{ status: 400, headers: { "Content-Type": "application/json" } },
						);
					}

					const { content, tags: tagData } = validationResult.data;

					// Generate a unique ID for the feedback
					const feedbackId = crypto.randomUUID();

					// Create the feedback record
					const [newFeedback] = await db
						.insert(schema.feedback)
						.values({
							id: feedbackId,
							userId: apiKeyRecord.userId,
							content,
						})
						.returning();

					// Create the tag records
					const tagsToInsert = tagData.map((tag) => ({
						id: tag.id,
						content: tag.content,
						feedbackId,
					}));

					const newTags = await db
						.insert(schema.tags)
						.values(tagsToInsert)
						.returning();

					return new Response(
						JSON.stringify({
							success: true,
							feedback: newFeedback,
							tags: newTags,
						}),
						{ status: 201, headers: { "Content-Type": "application/json" } },
					);
				} catch (error) {
					console.error("Error creating feedback:", error);
					return new Response(
						JSON.stringify({
							error: "Internal server error",
							message: error instanceof Error ? error.message : "Unknown error",
						}),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});
