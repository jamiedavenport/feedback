import { createFileRoute } from "@tanstack/react-router";
import logo from "@/assets/logo.svg?url";
import { Keys } from "@/components/keys";
import { FeedbackTable } from "@/components/table";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-10">
			<div className="flex items-center justify-between mb-10">
				<img src={logo} alt="Feedback Logo" className="h-10 rounded-xl" />
				<div className="flex items-center gap-3">
					<Button asChild variant="outline">
						<a
							href="https://github.com/jamiedavenport/feedback"
							target="_blank"
							rel="noopener noreferrer"
						>
							Github
						</a>
					</Button>
					<Button asChild variant="outline">
						<a
							href="https://www.npmjs.com/package/@jxdltd/feedback"
							target="_blank"
							rel="noopener noreferrer"
						>
							NPM
						</a>
					</Button>
					<Keys />
				</div>
			</div>

			<FeedbackTable />
		</div>
	);
}
