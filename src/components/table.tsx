import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { listFeedback, updateFeedbackStatus } from "@/feedback";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";

type FeedbackItem = {
	id: string;
	content: string;
	status: "new" | "resolved" | "archived";
	createdAt: Date;
	userId: string;
	tags: Array<{
		id: string;
		content: string;
		feedbackId: string;
	}>;
};

export function FeedbackTable() {
	const queryClient = useQueryClient();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	// Fetch feedback with "new" status
	const { data: feedbackData, isLoading } = useQuery({
		queryKey: ["feedback", "new"],
		queryFn: () => listFeedback({ data: { statuses: ["new"] } }),
	});

	// Update status mutation
	const updateStatusMutation = useMutation({
		mutationFn: ({
			feedbackId,
			status,
		}: {
			feedbackId: string;
			status: "new" | "resolved" | "archived";
		}) => updateFeedbackStatus({ data: { feedbackId, status } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["feedback"] });
		},
	});

	// Extract all unique tag IDs and their content
	const uniqueTags = useMemo(() => {
		if (!feedbackData?.feedback) return [];

		const tagMap = new Map<string, string>();
		for (const feedback of feedbackData.feedback) {
			for (const tag of feedback.tags) {
				if (!tagMap.has(tag.id)) {
					tagMap.set(tag.id, tag.content);
				}
			}
		}

		return Array.from(tagMap.entries()).map(([id, content]) => ({
			id,
			content,
		}));
	}, [feedbackData]);

	// Define columns dynamically based on unique tags
	const columns = useMemo<ColumnDef<FeedbackItem>[]>(() => {
		// Get unique tag content values for each tag column for filtering
		const getTagValues = (tagId: string) => {
			const values = new Set<string>();
			if (!feedbackData?.feedback) return [];
			for (const feedback of feedbackData.feedback) {
				const tag = feedback.tags.find((t) => t.id === tagId);
				if (tag) values.add(tag.content);
			}
			return Array.from(values);
		};

		const baseColumns: ColumnDef<FeedbackItem>[] = [
			{
				accessorKey: "content",
				header: "Content",
				cell: ({ row }) => (
					<div className="max-w-md truncate">{row.getValue("content")}</div>
				),
			},
			{
				accessorKey: "createdAt",
				header: "Created",
				cell: ({ row }) => {
					const date = row.getValue("createdAt") as Date;
					return (
						<div className="whitespace-nowrap">
							{new Date(date).toLocaleDateString()}
						</div>
					);
				},
			},
		];

		// Add dynamic tag columns
		const tagColumns: ColumnDef<FeedbackItem>[] = uniqueTags.map((tag) => ({
			id: tag.id,
			accessorFn: (row) => {
				// Return the tag content if this tag exists on the feedback
				const matchingTag = row.tags.find((t) => t.id === tag.id);
				return matchingTag ? matchingTag.content : "";
			},
			header: ({ column }) => {
				const currentFilter = (column.getFilterValue() as string[]) ?? [];
				const availableValues = getTagValues(tag.id);

				return (
					<div className="flex items-center justify-center">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="h-8">
									{tag.id}
									{currentFilter.length > 0 && (
										<Badge variant="secondary" className="ml-1 rounded-sm px-1">
											{currentFilter.length}
										</Badge>
									)}
									<ChevronDown className="ml-1 h-3 w-3" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="center" className="w-[200px]">
								<DropdownMenuLabel>Filter by value</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{availableValues.map((value) => {
									const isSelected = currentFilter.includes(value);
									return (
										<DropdownMenuCheckboxItem
											key={value}
											checked={isSelected}
											onCheckedChange={(checked) => {
												if (checked) {
													column.setFilterValue([...currentFilter, value]);
												} else {
													column.setFilterValue(
														currentFilter.filter((v) => v !== value),
													);
												}
											}}
										>
											{value}
										</DropdownMenuCheckboxItem>
									);
								})}
								{currentFilter.length > 0 && (
									<>
										<DropdownMenuSeparator />
										<Button
											variant="ghost"
											size="sm"
											className="w-full justify-center"
											onClick={() => column.setFilterValue(undefined)}
										>
											Clear filter
										</Button>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
			cell: ({ row }) => {
				const value = row.getValue(tag.id) as string;
				return (
					<div className="text-center">
						{value ? (
							<Badge variant="secondary" className="text-xs">
								{value}
							</Badge>
						) : (
							<span className="text-muted-foreground">-</span>
						)}
					</div>
				);
			},
			filterFn: (row, id, filterValue) => {
				const value = row.getValue(id) as string;
				if (!filterValue || filterValue.length === 0) return true;
				// Filter by tag content values
				return (filterValue as string[]).includes(value);
			},
		}));

		const actionColumn: ColumnDef<FeedbackItem> = {
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => (
				<div className="text-right">
					<Button
						size="sm"
						variant="outline"
						onClick={() =>
							updateStatusMutation.mutate({
								feedbackId: row.original.id,
								status: "resolved",
							})
						}
						disabled={updateStatusMutation.isPending}
					>
						Resolve
					</Button>
				</div>
			),
		};

		return [...baseColumns, ...tagColumns, actionColumn];
	}, [uniqueTags, updateStatusMutation, feedbackData]);

	const table = useReactTable({
		data: feedbackData?.feedback ?? [],
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	if (isLoading) {
		return <div className="text-center py-8">Loading feedback...</div>;
	}

	if (!feedbackData?.feedback || feedbackData.feedback.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				No new feedback to display
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filters and controls */}
			<div className="flex items-center gap-4">
				<Input
					placeholder="Filter content..."
					value={(table.getColumn("content")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("content")?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>

				{/* Column visibility */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="ml-auto">
							Columns <ChevronDown className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} row(s) total.
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
