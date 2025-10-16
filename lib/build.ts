import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

const distDir = join(import.meta.dir, "dist");

async function clean() {
	console.log("🧹 Cleaning dist directory...");
	if (existsSync(distDir)) {
		await rm(distDir, { recursive: true, force: true });
	}
}

async function buildClient() {
	console.log("📦 Building client...");

	const result = await Bun.build({
		entrypoints: [join(import.meta.dir, "client.ts")],
		outdir: join(distDir, "client"),
		target: "browser",
		format: "esm",
		minify: false,
		sourcemap: "external",
		splitting: false,
		naming: {
			entry: "index.js",
		},
	});

	if (!result.success) {
		console.error("❌ Client build failed:");
		for (const log of result.logs) {
			console.error(log);
		}
		throw new Error("Client build failed");
	}

	console.log("✅ Client build successful");
}

async function buildServer() {
	console.log("📦 Building server...");

	const result = await Bun.build({
		entrypoints: [join(import.meta.dir, "server.ts")],
		outdir: join(distDir, "server"),
		target: "node",
		format: "esm",
		minify: false,
		sourcemap: "external",
		splitting: false,
		external: ["zod"], // Don't bundle dependencies
		naming: {
			entry: "index.js",
		},
	});

	if (!result.success) {
		console.error("❌ Server build failed:");
		for (const log of result.logs) {
			console.error(log);
		}
		throw new Error("Server build failed");
	}

	console.log("✅ Server build successful");
}

async function generateTypes() {
	console.log("📝 Generating type declarations...");

	// Create a temporary tsconfig for building
	const tsconfigPath = join(import.meta.dir, "tsconfig.build.json");

	const tsconfig = {
		extends: "../tsconfig.json",
		compilerOptions: {
			declaration: true,
			emitDeclarationOnly: true,
			outDir: "./dist",
			rootDir: ".",
			noEmit: false,
			skipLibCheck: true,
			moduleResolution: "node",
			module: "ESNext",
		},
		include: ["client.ts", "server.ts"],
		exclude: ["node_modules", "dist", "build.ts"],
	};

	await Bun.write(tsconfigPath, JSON.stringify(tsconfig, null, 2));

	try {
		// Run TypeScript compiler for type declarations
		await $`bunx tsc -p ${tsconfigPath}`;
		console.log("✅ Type declarations generated");
	} catch (error) {
		console.error("❌ Type generation failed:", error);
		throw error;
	} finally {
		// Clean up temporary tsconfig
		await rm(tsconfigPath, { force: true });
	}
}

async function copyPackageFiles() {
	console.log("📄 Copying package files...");

	// Copy package.json
	const packageJson = await Bun.file(
		join(import.meta.dir, "package.json"),
	).text();
	await Bun.write(join(distDir, "package.json"), packageJson);

	// Create README
	const readme = `# Feedback SDK

A simple, type-safe feedback collection SDK for JavaScript/TypeScript applications.

## Installation

\`\`\`bash
npm install feedback
# or
bun add feedback
\`\`\`

## Usage

### Client-side

\`\`\`typescript
import { feedback, configureFeedback } from 'feedback/client';

// Configure the endpoint (optional)
configureFeedback({
  endpoint: '/api/feedback'
});

// Submit feedback
const result = await feedback('This is my feedback');
console.log(result);
\`\`\`

### Server-side

\`\`\`typescript
import { createFeedbackHandler } from 'feedback/server';

const handler = createFeedbackHandler({
  apiKey: 'your-api-key',
  tags: [
    { id: '1', content: 'feature-request' },
    { id: '2', content: 'bug' }
  ]
});

// Use with your framework (example with standard Request/Response)
export async function POST(request: Request) {
  return handler(request);
}
\`\`\`

## API

### Client

- \`configureFeedback(options)\` - Configure the default feedback endpoint
- \`feedback(content, options?)\` - Submit feedback to the configured endpoint

### Server

- \`createFeedbackHandler(options)\` - Create a request handler for processing feedback

## License

MIT
`;

	await Bun.write(join(distDir, "README.md"), readme);

	console.log("✅ Package files copied");
}

async function build() {
	try {
		const startTime = Date.now();
		console.log("🚀 Starting build process...\n");

		await clean();
		await Promise.all([buildClient(), buildServer()]);
		await generateTypes();
		await copyPackageFiles();

		const duration = ((Date.now() - startTime) / 1000).toFixed(2);
		console.log(`\n✨ Build completed successfully in ${duration}s`);
		console.log(`📦 Output directory: ${distDir}`);
	} catch (error) {
		console.error("\n❌ Build failed:", error);
		process.exit(1);
	}
}

// Run the build
build();
