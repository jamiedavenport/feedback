import type * as React from "react";
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { useFieldContext } from "./context";

type Props = {
	label: string;
	placeholder?: string;
	children: React.ReactNode;
};

export function SelectField({ label, placeholder, children }: Props) {
	const field = useFieldContext<string>();

	return (
		<Field>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Select
				value={field.state.value}
				onValueChange={(value) => field.handleChange(value)}
			>
				<SelectTrigger
					aria-invalid={field.state.meta.errors.length > 0}
					id={field.name}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>{children}</SelectContent>
			</Select>
			<FieldError>
				{field.state.meta.errors.map((e) => e?.message).join(", ")}
			</FieldError>
		</Field>
	);
}
