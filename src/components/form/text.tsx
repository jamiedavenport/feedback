import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { useFieldContext } from "./context";

type Props = {
	label: string;
	type: "text" | "email" | "password";
};

export function TextField({ label, type }: Props) {
	const field = useFieldContext<string>();
	return (
		<Field>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				type={type}
				aria-invalid={field.state.meta.errors.length > 0}
				id={field.name}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				onBlur={field.handleBlur}
				autoComplete="off"
			/>
			<FieldError>
				{field.state.meta.errors.map((e) => e?.message).join(", ")}
			</FieldError>
		</Field>
	);
}
