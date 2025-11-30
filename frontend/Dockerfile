FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "run", "start"]

