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
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";

export const Route = createFileRoute("/sign/up")({
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
			await auth.signUp.email({
				name: value.email,
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
					<CardTitle>Sign Up</CardTitle>
					<CardDescription>
						Sign up to start collecting customer feedback.
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
									<form.SubmitButton>Sign Up</form.SubmitButton>
								</form.AppForm>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			<p className="text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link className="text-primary" to="/sign/in">
					Sign in
				</Link>
			</p>
		</>
	);
}
