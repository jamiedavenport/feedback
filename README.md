# Feedback

A simple, type-safe feedback collection SDK for any web application. Collect user feedback with automatic tagging and centralized management.

## Installation

```bash
npm install @jxdltd/feedback
# or
yarn add @jxdltd/feedback
# or
bun add @jxdltd/feedback
```

**Peer Dependencies**: This package requires `zod` to be installed in your project.

```bash
npm install zod
```

## Getting Started

### 1. Sign Up and Get Your API Key

1. Visit [feedback.jxd.dev](https://feedback.jxd.dev)
2. Create an account or sign in
3. Navigate to your dashboard
4. Generate a new API key for your project
5. Copy your API key - you'll need it for the server setup

> **Important:** Keep your API key secure! Never expose it in client-side code. Always use it only in server-side handlers.

### 2. Set Up the Server Handler

The server handler acts as a secure proxy between your client and the feedback service. It includes your API key and automatically tags feedback based on your configuration.

#### Example: Next.js App Router

Create a route handler at `app/api/feedback/route.ts`:

```typescript
import { createFeedbackHandler } from '@jxdltd/feedback/server';

const handler = createFeedbackHandler({
  apiKey: process.env.FEEDBACK_API_KEY!, // Store in environment variable
  tags: [
    { id: 'app', content: 'my-app' },
    { id: 'environment', content: process.env.NODE_ENV || 'development' },
    { id: 'version', content: process.env.APP_VERSION || '1.0.0' },
  ],
});

export async function POST(request: Request) {
  return handler(request);
}
```

#### Example: Express

```typescript
import express from 'express';
import { createFeedbackHandler } from '@jxdltd/feedback/server';

const app = express();

const feedbackHandler = createFeedbackHandler({
  apiKey: process.env.FEEDBACK_API_KEY!,
  tags: [
    { id: 'app', content: 'my-express-app' },
    { id: 'environment', content: process.env.NODE_ENV || 'development' },
  ],
});

app.post('/api/feedback', (req, res) => {
  feedbackHandler(req as any).then(response => {
    res.status(response.status).json(response);
  });
});
```

#### Example: Hono

```typescript
import { Hono } from 'hono';
import { createFeedbackHandler } from '@jxdltd/feedback/server';

const app = new Hono();

const feedbackHandler = createFeedbackHandler({
  apiKey: process.env.FEEDBACK_API_KEY!,
  tags: [
    { id: 'app', content: 'my-hono-app' },
    { id: 'platform', content: 'cloudflare-workers' },
  ],
});

app.post('/api/feedback', async (c) => {
  const response = await feedbackHandler(c.req.raw);
  return response;
});
```

#### Environment Variables

Create a `.env` file (or add to your existing one):

```bash
FEEDBACK_API_KEY=your_api_key_here
```

#### About Tags

Tags help you organize and filter feedback in your dashboard. Common use cases:

- **Environment**: `development`, `staging`, `production`
- **Version**: Track which app version feedback came from
- **Platform**: `web`, `mobile`, `desktop`
- **Feature**: Identify specific features or pages
- **User Tier**: `free`, `pro`, `enterprise`

Tags can be dynamic based on your environment or configuration.

### 3. Set Up the Client

Now that your server handler is ready, set up the client to submit feedback.

#### Basic Usage

```typescript
import { feedback } from '@jxdltd/feedback/client';

// Submit feedback
try {
  const response = await feedback('This feature is amazing!');
  console.log('Feedback submitted:', response);
} catch (error) {
  console.error('Failed to submit feedback:', error);
}
```

#### React Example with Form

```typescript
import { useState } from 'react';
import { feedback } from '@jxdltd/feedback/client';

export function FeedbackForm() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await feedback(content);
      setSubmitted(true);
      setContent('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your feedback..."
        required
        disabled={loading}
      />
      <button type="submit" disabled={loading || !content}>
        {loading ? 'Submitting...' : 'Send Feedback'}
      </button>
      {submitted && <p>Thank you for your feedback!</p>}
    </form>
  );
}
```

#### Custom Endpoint

If your API route is not at `/api/feedback`, you can configure it:

```typescript
import { configureFeedback, feedback } from '@jxdltd/feedback/client';

// Configure once at app initialization
configureFeedback({
  endpoint: '/custom/feedback/route',
});

// Or override per call
await feedback('My feedback', {
  endpoint: '/custom/feedback/route',
});
```

#### Vue Example

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <textarea 
      v-model="content" 
      placeholder="Share your feedback..."
      required
      :disabled="loading"
    />
    <button type="submit" :disabled="loading || !content">
      {{ loading ? 'Submitting...' : 'Send Feedback' }}
    </button>
    <p v-if="submitted">Thank you for your feedback!</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { feedback } from '@jxdltd/feedback/client';

const content = ref('');
const loading = ref(false);
const submitted = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  try {
    await feedback(content.value);
    submitted.value = true;
    content.value = '';
    setTimeout(() => submitted.value = false, 3000);
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    alert('Failed to submit feedback. Please try again.');
  } finally {
    loading.value = false;
  }
};
</script>
```

## API Reference

### Server

#### `createFeedbackHandler(options)`

Creates a feedback handler for your server.

**Options:**
- `apiKey` (string, required): Your API key from feedback.jxd.dev
- `tags` (array, required): Array of tag objects to attach to all feedback
  - Each tag must have `id` (string) and `content` (string)

**Returns:** An async function that accepts a `Request` object and returns a `Response`.

### Client

#### `feedback(content, options?)`

Submits feedback to your server.

**Parameters:**
- `content` (string, required): The feedback message
- `options` (object, optional):
  - `endpoint` (string): Custom endpoint URL (default: `/api/feedback`)

**Returns:** Promise resolving to `FeedbackResponse`

```typescript
type FeedbackResponse = {
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
```

#### `configureFeedback(options)`

Configures default settings for the feedback client.

**Options:**
- `endpoint` (string): Default endpoint for all feedback calls

## Best Practices

1. **Keep API Keys Secure**: Never expose your API key in client-side code. Always use it only in server handlers.

2. **Use Meaningful Tags**: Choose tags that help you filter and organize feedback effectively in your dashboard.

3. **Error Handling**: Always wrap feedback calls in try-catch blocks to handle network errors gracefully.

4. **User Experience**: Provide clear feedback to users when their submission succeeds or fails.

5. **Rate Limiting**: Consider implementing rate limiting on your server handler to prevent abuse.

## Troubleshooting

### "Method not allowed" error
Make sure you're sending a POST request to the feedback endpoint.

### "Invalid request body" error
Ensure the feedback content is a non-empty string.

### Feedback not appearing in dashboard
- Verify your API key is correct
- Check that your server handler is properly forwarding requests
- Ensure tags are formatted correctly with `id` and `content` fields

### CORS errors
If you're calling the feedback endpoint from a different origin, ensure your server has CORS configured properly.

## Support

For issues, questions, or feature requests:
- GitHub Issues: [github.com/jamiedavenport/feedback/issues](https://github.com/jamiedavenport/feedback/issues)
- Dashboard: [feedback.jxd.dev](https://feedback.jxd.dev)

## License

MIT