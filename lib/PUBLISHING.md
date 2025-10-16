# Publishing to NPM

This guide explains how to build and publish the feedback SDK to NPM.

## Prerequisites

1. Install Bun (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Create an NPM account at https://www.npmjs.com/signup

3. Login to NPM:
   ```bash
   npm login
   ```

## Build Process

The build script (`build.ts`) uses Bun's bundler to:
- Bundle client code for browser environments
- Bundle server code for Node.js environments
- Generate TypeScript declarations
- Create source maps for debugging
- Copy package files and generate README

### Running the Build

```bash
cd lib
bun run build
```

This will:
1. Clean the `dist/` directory
2. Build client bundle (`dist/client/index.js`)
3. Build server bundle (`dist/server/index.js`)
4. Generate type declarations (`dist/client.d.ts`, `dist/server.d.ts`)
5. Copy `package.json` and generate `README.md` to `dist/`

## Package Configuration

The `package.json` uses modern ESM exports with dual entry points:

```json
{
  "exports": {
    "./client": {
      "types": "./dist/client.d.ts",
      "import": "./dist/client/index.js"
    },
    "./server": {
      "types": "./dist/server.d.ts",
      "import": "./dist/server/index.js"
    }
  }
}
```

This allows consumers to import:
```typescript
import { feedback } from '@your-org/feedback/client';
import { createFeedbackHandler } from '@your-org/feedback/server';
```

## Before Publishing

1. **Update package.json**:
   - Change `@your-org/feedback` to your actual package name
   - Update version number following [semver](https://semver.org/)
   - Update repository URLs
   - Update author information

2. **Test the package locally**:
   ```bash
   cd lib
   bun run build
   bun link
   ```
   
   Then in another project:
   ```bash
   bun link @your-org/feedback
   ```

3. **Verify the build output**:
   ```bash
   cd lib/dist
   ls -la
   # Should show:
   # - client/
   # - server/
   # - client.d.ts
   # - server.d.ts
   # - package.json
   # - README.md
   ```

## Publishing

### First-time publish

```bash
cd lib/dist
npm publish --access public
```

Note: The `prepublishOnly` script will automatically run the build before publishing.

### Publishing updates

1. Update the version in `package.json`:
   ```bash
   cd lib
   # For patches (1.0.0 -> 1.0.1)
   npm version patch
   
   # For minor updates (1.0.0 -> 1.1.0)
   npm version minor
   
   # For major updates (1.0.0 -> 2.0.0)
   npm version major
   ```

2. Publish from the dist directory:
   ```bash
   cd lib/dist
   npm publish
   ```

## Package Structure

```
lib/
├── build.ts           # Build script
├── client.ts          # Client-side source
├── server.ts          # Server-side source
├── package.json       # Package configuration
├── .gitignore         # Git ignore rules
├── .npmignore         # NPM ignore rules
└── dist/              # Build output (gitignored)
    ├── client/
    │   ├── index.js
    │   └── index.js.map
    ├── server/
    │   ├── index.js
    │   └── index.js.map
    ├── client.d.ts
    ├── server.d.ts
    ├── package.json
    └── README.md
```

## CI/CD Integration

You can automate publishing with GitHub Actions:

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: cd lib && bun install
      - run: cd lib && bun run build
      - uses: JS-DevTools/npm-publish@v1
        with:
          token: ${{ secrets.NPM_TOKEN }}
          package: lib/dist/package.json
```

## Troubleshooting

### Build fails

1. Ensure Bun is installed: `bun --version`
2. Check that all source files exist: `client.ts`, `server.ts`
3. Verify TypeScript is available: `bunx tsc --version`

### Type declarations not generated

The build script uses TypeScript compiler to generate `.d.ts` files. Ensure:
- TypeScript is in devDependencies
- The temporary `tsconfig.build.json` is being created correctly
- No syntax errors in source files

### NPM publish fails

1. Ensure you're logged in: `npm whoami`
2. Check package name availability: `npm view @your-org/feedback`
3. Verify you have permission to publish to the scope (for scoped packages)

## Development Workflow

1. Make changes to `client.ts` or `server.ts`
2. Run `bun run build` to test the build
3. Test locally using `bun link`
4. Commit changes
5. Update version
6. Publish to NPM

