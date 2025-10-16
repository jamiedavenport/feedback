import { createFileRoute } from "@tanstack/react-router";
import { Keys } from "@/components/keys";

export const Route = createFileRoute("/_authenticated/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<Keys />
		</div>
	);
}
