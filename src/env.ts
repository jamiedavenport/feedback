import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		BETTER_AUTH_SECRET: z.string(),

		DATABASE_URL: z.url(),

		// POLAR_ACCESS_TOKEN: z.string(),
		// POLAR_MONTHLY_PRODUCT_ID: z.string(),
		// POLAR_YEARLY_PRODUCT_ID: z.string(),
	},

	clientPrefix: "VITE_",

	client: {
		VITE_SENTRY_DSN: z.string(),
	},

	runtimeEnv: {
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,

		DATABASE_URL: process.env.DATABASE_URL,

		// GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		// GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

		OPENAI_API_KEY: process.env.OPENAI_API_KEY,

		// POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
		// POLAR_MONTHLY_PRODUCT_ID: process.env.POLAR_MONTHLY_PRODUCT_ID,
		// POLAR_YEARLY_PRODUCT_ID: process.env.POLAR_YEARLY_PRODUCT_ID,

		// todo fix bun push
		VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN,
	},

	emptyStringAsUndefined: true,
});
