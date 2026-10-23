FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN mkdir -p uploads prisma/backups
EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true; node prisma/seed.js || true; node src/server.js"]
