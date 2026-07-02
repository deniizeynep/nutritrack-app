FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run db:generate
RUN npm run build

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "run", "start"]
