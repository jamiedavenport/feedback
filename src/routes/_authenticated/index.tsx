import { createFileRoute } from "@tanstack/react-router";
import { Keys } from "@/components/keys";
import { FeedbackTable } from "@/components/table";

export const Route = createFileRoute("/_authenticated/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-8 p-8">
			<div>
				<h1 className="text-3xl font-bold mb-4">Feedback Dashboard</h1>
				<FeedbackTable />
			</div>
			<div>
				<h2 className="text-2xl font-bold mb-4">API Keys</h2>
				<Keys />
			</div>
		</div>
	);
}
