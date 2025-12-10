# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./

# Copy packages structure
COPY packages ./packages
COPY holmdigital-website ./holmdigital-website
COPY holmdigital-wiki ./holmdigital-wiki

# Install dependencies and build
# We use 'npm ci' for reliable builds, and run from root to handle workspaces
RUN npm ci

# Build all workspace packages (engine, components, standards)
RUN npm run build


# Build Website
WORKDIR /app/holmdigital-website
RUN npm run build

# Build Wiki
# IMPORTANT: Vite needs base set to /wiki/ for subpath deployment
# We override it via CLI argument or env var if the script supports it, 
# but easiest is to set --base in the build command here
WORKDIR /app/holmdigital-wiki
RUN npx vite build --base=/wiki/

# Release Stage
FROM nginx:alpine

# Copy Nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=builder /app/holmdigital-website/dist /usr/share/nginx/html/main
COPY --from=builder /app/holmdigital-wiki/dist /usr/share/nginx/html/wiki

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
