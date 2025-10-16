import z from "zod";

export type HandlerOptions = {
	apiKey: string;
	tags: Record<string, string>;
};

export const feedbackSchema = z.object({
	content: z.string().min(1),
});

export function createFeedbackHandler(options: HandlerOptions) {
	return async (request: Request) => {
		try {
			// Only accept POST requests
			if (request.method !== "POST") {
				return new Response(JSON.stringify({ error: "Method not allowed" }), {
					status: 405,
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

			const { content } = validationResult.data;

			// Prepare the payload with content and tags
			const payload = {
				content,
				tags: options.tags,
			};

			// Forward the request to feedback.jxd.dev/api/feedback
			const response = await fetch("https://feedback.jxd.dev/api/feedback", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": options.apiKey,
				},
				body: JSON.stringify(payload),
			});

			// Get the response body
			const responseData = await response.json();

			// Return the response from the feedback service
			return new Response(JSON.stringify(responseData), {
				status: response.status,
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Error forwarding feedback:", error);
			return new Response(
				JSON.stringify({
					error: "Failed to submit feedback",
					message: error instanceof Error ? error.message : "Unknown error",
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			);
		}
	};
}
