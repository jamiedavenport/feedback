import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useFieldContext } from "./context";

type Props = {
	label: string;
};

export function DateField({ label }: Props) {
	const field = useFieldContext<string>();

	const formatDate = (dateString: string) => {
		if (!dateString) return null;
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const handleSelect = (date: Date | undefined) => {
		if (date) {
			// Format date as YYYY-MM-DD for consistency
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			field.handleChange(`${year}-${month}-${day}`);
		}
	};

	const selectedDate = field.state.value
		? new Date(field.state.value)
		: undefined;

	return (
		<Field>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-full justify-start text-left font-normal",
							!field.state.value && "text-muted-foreground",
						)}
						aria-invalid={field.state.meta.errors.length > 0}
						id={field.name}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{field.state.value ? formatDate(field.state.value) : "Pick a date"}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={handleSelect}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
			<FieldError>
				{field.state.meta.errors.map((e) => e?.message).join(", ")}
			</FieldError>
		</Field>
	);
}
