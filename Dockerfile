# Stage 1: Build the React/TypeScript frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Compile the TypeScript backend
FROM node:20-alpine AS server-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

# Stage 3: Lightweight production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=server-builder /app/dist ./dist
COPY --from=client-builder /app/client/dist ./client/dist
EXPOSE 5001
CMD ["node", "dist/server.js"]
