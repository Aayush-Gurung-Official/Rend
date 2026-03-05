FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

ENV VITE_API_URL=http://backend:5000

EXPOSE 5173

CMD ["npm", "run", "dev"]

