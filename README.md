# Feedback

A simple, type-safe feedback collection SDK for any web application. Collect user feedback with automatic tagging and centralized management.

## Installation

```bash
bun add @jxdltd/feedback
```

## Quick Start

### Server Setup

Create a feedback handler on your server that forwards feedback to the centralized service:

```typescript
import { createFeedbackHandler } from "@jxdltd/feedback/server";

// Create the handler with your API key and tags
const handler = createFeedbackHandler({
  apiKey: process.env.FEEDBACK_API_KEY,
  tags: {
    app: "my-app",
    environment: "production",
  },
});

// Use with your framework (example: Next.js API route)
export async function POST(request: Request) {
  return handler(request);
}
```

### Client Usage

Submit feedback from your client-side application:

```typescript
import { feedback } from "@jxdltd/feedback/client";

// Submit feedback
await feedback("This is great!");
```