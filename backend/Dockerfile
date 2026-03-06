FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install

COPY src ./src

ENV NODE_ENV=development
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "run", "dev"]

