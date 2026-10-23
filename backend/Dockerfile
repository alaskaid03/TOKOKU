FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN mkdir -p uploads prisma/backups
EXPOSE 3001
ENV PORT=3001
CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true; node prisma/seed.js || true; node src/server.js"]
