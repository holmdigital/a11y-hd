# Deployment Guide: Holm Digital Unified Server

This guide explains how to deploy both `holmdigital.se` (Main Site) and `wiki.holmdigital.se` (Wiki) on a single server using Docker.

## Prerequisites
- Docker Engine & Docker Compose installed on the server.
- Port 80 open (and 443 if you add SSL later).

## Structure
The setup uses a **Multi-Stage Build**:
1.  **Build Stage**: Compiles both `holmdigital-website` and `holmdigital-wiki` using Node.js.
2.  **Run Stage**: Serves the static files using a lightweight Nginx container.

## How to Deploy

### 1. Build and Run
Run this single command in the project root:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 2. Verify
- **Main Site**: Open `http://localhost/` (or your server IP).
- **Wiki**: Open `http://localhost/wiki/`.

## Configuration Details

### Routing
- The Main Site is served at the root `/`.
- The Wiki is served at `/wiki/`. 
    - *Note: The Wiki build command in `Production.Dockerfile` sets the base path to `/wiki/` automatically.*

### Nginx
Configuration is located at `nginx/nginx.conf`. It handles:
- Reverse proxying to the correct folder.
- `try_files` for Single Page Application (SPA) routing (refreshing page won't 404).
- Gzip compression for performance.

## Troubleshooting
**"I see a blank page on the Wiki"**
Check the console. If you see 404s for assets (e.g. `/_assets/index.js`), it means the `base` path wasn't set correctly during build. The Dockerfile handles this via `npx vite build --base=/wiki/`.

**"Address already in use"**
Ensure no other service (like another Apache/Nginx) is using port 80.
