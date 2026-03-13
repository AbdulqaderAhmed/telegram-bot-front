# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ---------- Production stage ----------
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 4004

CMD ["npm", "start"]
