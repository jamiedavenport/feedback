import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { authMiddleware } from "@/auth/middleware";
import { db, schema } from "@/db";

/**
 * List feedback for the authenticated user with optional status filtering
 */
export const listFeedback = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			statuses: z.array(z.enum(["new", "resolved", "archived"])).optional(),
		}),
	)
	.handler(async ({ context, data }) => {
		const userId = context.auth.user.id;
		const { statuses } = data;

		// Build the query
		const feedbackList = await db.query.feedback.findMany({
			where: (feedback, { eq, and, inArray }) => {
				const conditions = [eq(feedback.userId, userId)];

				if (statuses && statuses.length > 0) {
					conditions.push(inArray(feedback.status, statuses));
				}

				return and(...conditions);
			},
			with: {
				tags: true,
			},
			orderBy: (feedback, { desc }) => [desc(feedback.createdAt)],
		});

		return {
			success: true,
			feedback: feedbackList,
		};
	});

/**
 * Update the status of a feedback item
 */
export const updateFeedbackStatus = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			feedbackId: z.string(),
			status: z.enum(["new", "resolved", "archived"]),
		}),
	)
	.handler(async ({ context, data }) => {
		const userId = context.auth.user.id;
		const { feedbackId, status } = data;

		// First verify the feedback belongs to the user
		const existingFeedback = await db.query.feedback.findFirst({
			where: eq(schema.feedback.id, feedbackId),
		});

		if (!existingFeedback) {
			throw new Error("Feedback not found");
		}

		if (existingFeedback.userId !== userId) {
			throw new Error("Unauthorized");
		}

		// Update the status
		const [updatedFeedback] = await db
			.update(schema.feedback)
			.set({ status })
			.where(eq(schema.feedback.id, feedbackId))
			.returning();

		return {
			success: true,
			feedback: updatedFeedback,
		};
	});
