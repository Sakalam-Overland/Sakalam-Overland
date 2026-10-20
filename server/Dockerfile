# Build from the repo root: docker build -f server/Dockerfile .
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci -w server
COPY shared shared
COPY server server
ENV NODE_ENV=production PORT=4000
EXPOSE 4000
CMD ["npm", "start", "-w", "server"]
