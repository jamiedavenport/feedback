import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
} from "@tanstack/react-router";
import z from "zod";
import { auth } from "@/auth/client";
// import { SignInWithGithub } from "@/components/auth/github";
import { useAppForm } from "@/components/form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";

export const Route = createFileRoute("/sign/in")({
	component: RouteComponent,
	loader: async ({ context }) => {
		if (context.auth) {
			throw redirect({ to: "/" });
		}
	},
});

const formSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});

function RouteComponent() {
	const router = useRouter();

	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await auth.signIn.email({
				email: value.email,
				password: value.password,
			});

			await router.navigate({ to: "/" });
		},
	});

	return (
		<>
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Sign In</CardTitle>
					<CardDescription>
						Sign in to manage your customer feedback.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.AppField
								name="email"
								children={(field) => (
									<field.TextField label="Email" type="email" />
								)}
							/>
							<form.AppField
								name="password"
								children={(field) => (
									<field.TextField label="Password" type="password" />
								)}
							/>
							<Field>
								<form.AppForm>
									<form.SubmitButton>Sign In</form.SubmitButton>
								</form.AppForm>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			<p className="text-sm text-muted-foreground">
				Don't have an account?{" "}
				<Link className="text-primary" to="/sign/up">
					Sign up
				</Link>
			</p>
		</>
	);
}
