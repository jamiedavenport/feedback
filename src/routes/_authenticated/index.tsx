import { createFileRoute } from "@tanstack/react-router";
import logo from "@/assets/logo.svg?url";
import { Keys } from "@/components/keys";
import { FeedbackTable } from "@/components/table";

export const Route = createFileRoute("/_authenticated/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-10">
			<div className="flex items-center justify-between mb-10">
				<img src={logo} alt="Feedback Logo" className="h-10 rounded-xl" />
				<Keys />
			</div>
			<FeedbackTable />
		</div>
	);
}
