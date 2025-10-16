import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

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
			POST: ({ request }) => {
				// get the api key from the request.
				// validate the api key.
				// create the feedback and tags.

				return new Response("Feedback created", { status: 200 });
			},
		},
	},
});
