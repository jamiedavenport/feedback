import { createMiddleware, createStart } from "@tanstack/react-start";
import { Sentry } from "./sentry";

const sentryMiddleware = createMiddleware().server(async ({ next }) => {
	try {
		const resp = await next();
		return resp;
	} catch (error) {
		console.log("Sentry Middleware Error", error);
		Sentry.captureException(error);
		throw error;
	}
});

// todo
// biome-ignore lint/suspicious/noTsIgnore: todo
// @ts-ignore
export const startInstance = createStart(() => {
	return {
		requestMiddleware: [sentryMiddleware],
		functionMiddleware: [sentryMiddleware],
	};
});
