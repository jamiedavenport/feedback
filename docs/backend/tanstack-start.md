# Tanstack Start

## Prerequisites

An API key from [feedback.jxd.dev](https://feedback.jxd.dev).

## Install

```bash
bun add @jxdltd/feedback
```

## Usage

```ts
// src/routes/api/feedback.ts

import { createFeedbackHandler } from "@jxdltd/feedback/server";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getAuth } from "@/auth/functions";
import { env } from "@/env";

export const Route = createFileRoute("/api/feedback")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const auth = await getAuth(); // Custom auth logic.

				if (!auth) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}

				return createFeedbackHandler({
					apiKey: env.FEEDBACK_KEY,
					tags: {
                        // Add any tags you want to add to the feedback
						app: "your-app",
						user: auth.user.email,
					},
				})(request);
			},
		},
	},
});
```