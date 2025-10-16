import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import logo from "@/assets/logo.svg?url";

export const Route = createFileRoute("/sign")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (context.auth) {
			throw redirect({ to: "/" });
		}
	},
});

function RouteComponent() {
	return (
		<div className="flex flex-col items-center justify-center h-dvh bg-accent gap-10 p-10">
			<img src={logo} alt="Logo" className="h-10 rounded-xl" />
			<Outlet />
		</div>
	);
}
