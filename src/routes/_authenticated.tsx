import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (!context.auth) {
			throw redirect({ to: "/sign/in" });
		}
	},
});

function RouteComponent() {
	return <Outlet />;
}
