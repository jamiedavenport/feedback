export type FeedbackOptions = {
	endpoint?: string;
};

export type FeedbackResponse = {
	success: boolean;
	feedback?: {
		id: string;
		userId: string;
		content: string;
		status: string;
		createdAt: Date;
	};
	tags?: Array<{
		id: string;
		content: string;
		feedbackId: string;
	}>;
	error?: string;
};

let defaultEndpoint = "/api/feedback";

/**
 * Configure the default feedback endpoint
 */
export function configureFeedback(options: FeedbackOptions) {
	if (options.endpoint) {
		defaultEndpoint = options.endpoint;
	}
}

/**
 * Submit feedback to the configured endpoint
 * @param content The feedback content
 * @param options Optional configuration to override the default endpoint
 * @returns Promise resolving to the response data
 */
export async function feedback(
	content: string,
	options?: FeedbackOptions,
): Promise<FeedbackResponse> {
	const endpoint = options?.endpoint ?? defaultEndpoint;

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ content }),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(
			data.error || `Failed to submit feedback: ${response.status}`,
		);
	}

	return data;
}
