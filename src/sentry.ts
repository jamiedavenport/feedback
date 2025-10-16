import * as Sentry from "@sentry/tanstackstart-react";
import { env } from "./env";

Sentry.init({
	dsn: env.VITE_SENTRY_DSN,
	environment: import.meta.env.NODE_ENV,
});

export { Sentry };
