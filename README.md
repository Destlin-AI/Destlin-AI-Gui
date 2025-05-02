# V0 coding guidelines

*Automatically synced with your [v0.dev](https://v0.dev) deployments*


[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:



## Build your app

Continue building your app on:



## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository


## Running with Docker

This project includes a Docker setup for local development and production builds. The Docker configuration uses multi-stage builds and Docker Compose for easy management.

- **Node.js version:** 22.14.0 (as specified in the Dockerfile)
- **pnpm version:** 10.4.1 (managed via Corepack)

### Build and Run

To build and start the application using Docker Compose:

```sh
# Build and start the app
docker compose up --build
```

This will build the image and start the `typescript-app` service.

### Ports

- The application is exposed on **port 3000** (host: 3000 → container: 3000)

### Environment Variables

- No required environment variables are specified by default in the Docker or Compose files.
- If you need to provide environment variables, create a `.env` file in the project root and uncomment the `env_file` line in `docker-compose.yaml`.

### Special Configuration

- The Dockerfile uses a non-root user (`appuser`) for running the app in production.
- Only the necessary files and directories are copied into the final image for optimized size and security.
- The app is started with `pnpm start` in production mode.

### Networks

- The service is attached to the `appnet` Docker network (bridge driver).

For any additional services (e.g., databases), update the `docker-compose.yaml` and add them under `services` with appropriate `depends_on` configuration.
