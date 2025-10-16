import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./context";
import { DateField } from "./date";
import { SelectField } from "./select";
import { SubmitButton } from "./submit";
import { TextField } from "./text";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		SelectField,
		DateField,
		// NumberField,
	},
	formComponents: {
		SubmitButton,
	},
	fieldContext,
	formContext,
});
