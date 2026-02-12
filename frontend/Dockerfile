# Frontend Dockerfile
FROM node:20.19.4-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ----------------------------
FROM node:20.19.4-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# ----------------------------
FROM node:20.19.4-alpine AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["serve", "-s", "dist", "-l", "3001"]
