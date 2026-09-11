# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite embeds this at build time (set in Coolify build args / env)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Serve static assets with nginx
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
