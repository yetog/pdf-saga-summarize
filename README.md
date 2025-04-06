
# PDF Saga

PDF Saga is a web application for analyzing and interacting with PDF documents. It provides summary extraction and an AI-powered chat interface to ask questions about your documents.

## Features

- PDF upload and processing
- Document summarization
- AI-powered chat interface to query document contents
- Responsive design with mobile support
- Fallback mode when backend is unavailable

## Technical Stack

- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- IONOS AI Model Hub integration for AI chat capabilities

## Configuration

The application is already configured with IONOS AI Model Hub API keys and model IDs:

- Chat Model ID: 0b6c4a15-bb8d-4092-82b0-f357b77c59fd
- Image Model ID: stabilityai/stable-diffusion-xl-base-1.0

## Getting Started

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:8080](http://localhost:8080) in your browser.

## Deployment

The application can be built for production using:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The production build will be in the `dist` folder.

## Backend Integration

By default, the application works in a frontend-only mode, using mock data for PDF processing. For full functionality, a backend server should be implemented.

The frontend is configured to connect to a backend at:
- Development: http://localhost:8000
- Production: Relative path /api on the same domain

You can toggle the `useMockApi` flag in `src/config.ts` to enable/disable mock mode. In the current configuration, mock mode is enabled by default.
