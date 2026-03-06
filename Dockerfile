FROM node:lts-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

USER node
STOPSIGNAL SIGTERM
CMD ["node", "."]
