import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { createKey, deleteKey, listKeys } from "@/keys";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function Keys() {
	const queryClient = useQueryClient();
	const keyNameId = useId();
	const [newKeyName, setNewKeyName] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	// Fetch all keys
	const { data: keys, isLoading } = useQuery({
		queryKey: ["api-keys"],
		queryFn: () => listKeys(),
	});

	// Create key mutation
	const createMutation = useMutation({
		mutationFn: (name: string) => createKey({ data: { name } }),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
			setNewKeyName("");
			setIsCreating(false);
			if (data) {
				setNewlyCreatedKey(data.key);
			}
		},
	});

	// Delete key mutation
	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteKey({ data: { id } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
		},
	});

	const handleCreateKey = (e: React.FormEvent) => {
		e.preventDefault();
		if (newKeyName.trim()) {
			createMutation.mutate(newKeyName);
		}
	};

	const handleCopyKey = async (key: string, id: string) => {
		await navigator.clipboard.writeText(key);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	const handleDeleteKey = (id: string) => {
		if (confirm("Are you sure you want to delete this API key?")) {
			deleteMutation.mutate(id);
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>API Keys</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl overflow-hidden">
				<DialogHeader>
					<DialogTitle>API Keys</DialogTitle>
					<DialogDescription>
						Manage your API keys for accessing the feedback API
					</DialogDescription>
				</DialogHeader>

				{/* Show newly created key */}
				{newlyCreatedKey && (
					<div className="rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950">
						<p className="mb-2 text-sm font-medium text-green-900 dark:text-green-100">
							API Key Created Successfully!
						</p>
						<p className="mb-2 text-xs text-green-700 dark:text-green-300">
							Make sure to copy your API key now. You won't be able to see it
							again!
						</p>
						<div className="flex items-start gap-2">
							<code className="flex-1 rounded bg-green-100 px-3 py-2 text-sm font-mono dark:bg-green-900 break-all overflow-hidden">
								{newlyCreatedKey}
							</code>
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									navigator.clipboard.writeText(newlyCreatedKey);
									setTimeout(() => setNewlyCreatedKey(null), 1000);
								}}
								className="flex-shrink-0"
							>
								<Copy className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}

				{/* List of keys */}
				<div className="space-y-2">
					{isLoading ? (
						<p className="text-sm text-muted-foreground">Loading keys...</p>
					) : keys && keys.length > 0 ? (
						keys.map((key) => (
							<div
								key={key.id}
								className="flex items-center justify-between gap-3 rounded-lg border p-3"
							>
								<div className="flex-1 min-w-0">
									<p className="font-medium truncate">{key.name}</p>
									<div className="flex items-center gap-2">
										<code className="text-xs text-muted-foreground truncate">
											{key.key.substring(0, 20)}...
										</code>
										<button
											type="button"
											onClick={() => handleCopyKey(key.key, key.id)}
											className="text-muted-foreground hover:text-foreground flex-shrink-0"
										>
											{copiedId === key.id ? (
												<Check className="h-3 w-3 text-green-500" />
											) : (
												<Copy className="h-3 w-3" />
											)}
										</button>
									</div>
									<p className="text-xs text-muted-foreground">
										Created: {new Date(key.createdAt).toLocaleDateString()}
									</p>
								</div>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => handleDeleteKey(key.id)}
									disabled={deleteMutation.isPending}
									className="flex-shrink-0"
								>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							</div>
						))
					) : (
						<p className="text-sm text-muted-foreground">
							No API keys yet. Create one below.
						</p>
					)}
				</div>

				<DialogFooter className="flex-col gap-4 sm:flex-col">
					{!isCreating ? (
						<Button
							onClick={() => setIsCreating(true)}
							variant="outline"
							className="w-full"
						>
							Create New Key
						</Button>
					) : (
						<form onSubmit={handleCreateKey} className="w-full space-y-4">
							<div className="space-y-2">
								<Label htmlFor={keyNameId}>Key Name</Label>
								<Input
									id={keyNameId}
									placeholder="e.g., Production API Key"
									value={newKeyName}
									onChange={(e) => setNewKeyName(e.target.value)}
									disabled={createMutation.isPending}
									required
								/>
							</div>
							<div className="flex gap-2">
								<Button
									type="submit"
									disabled={createMutation.isPending || !newKeyName.trim()}
									className="flex-1"
								>
									{createMutation.isPending ? "Creating..." : "Create Key"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setIsCreating(false);
										setNewKeyName("");
									}}
									disabled={createMutation.isPending}
								>
									Cancel
								</Button>
							</div>
						</form>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
