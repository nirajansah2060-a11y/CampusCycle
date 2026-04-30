FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev --registry=https://registry.npmjs.org --no-audit --no-fund

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
